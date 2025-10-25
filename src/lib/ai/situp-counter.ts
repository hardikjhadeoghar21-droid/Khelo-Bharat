'use client';

import { Landmark } from "@mediapipe/tasks-vision";

export enum FormError {
    BODY_NOT_VISIBLE = 'BODY_NOT_VISIBLE',
    BAD_CAMERA_ANGLE = 'BAD_CAMERA_ANGLE',
    INCOMPLETE_REP_UP = 'INCOMPLETE_REP_UP',
    INCOMPLETE_REP_DOWN = 'INCOMPLETE_REP_DOWN',
}

export const VALIDATION_ERROR_MESSAGES: Record<FormError, string> = {
    [FormError.BODY_NOT_VISIBLE]: "Your upper body is not fully visible. Please reposition.",
    [FormError.BAD_CAMERA_ANGLE]: "A side view is required. Please position the camera to your side.",
    [FormError.INCOMPLETE_REP_UP]: "Rep incomplete: Come up higher until your chest is near your knees.",
    [FormError.INCOMPLETE_REP_DOWN]: "Rep incomplete: Lie all the way back until your shoulders are down.",
}

type SitupState = 'down' | 'up';

// Helper to average landmark positions for smoother readings
class LandmarkSmoother {
    private history: Landmark[][] = [];
    private size: number;

    constructor(size: number = 3) {
        this.size = size;
    }

    add(landmarks: Landmark[]): Landmark[] {
        this.history.push(landmarks);
        if (this.history.length > this.size) {
            this.history.shift();
        }

        if (this.history.length === 0) {
            return [];
        }
        
        // Average the landmarks
        const averaged: Landmark[] = [];
        if (!this.history[0]) return [];

        const numLandmarks = this.history[0].length;

        for (let i = 0; i < numLandmarks; i++) {
            let x = 0, y = 0, z = 0, visibility = 0;
            let count = 0;
            for (const frame of this.history) {
                if (frame[i] && frame[i].visibility! > 0.5) { // Only average visible landmarks
                    x += frame[i].x;
                    y += frame[i].y;
                    z += frame[i].z!;
                    visibility += frame[i].visibility!;
                    count++;
                }
            }
            if (count > 0) {
                averaged[i] = {
                    x: x / count,
                    y: y / count,
                    z: z / count,
                    visibility: visibility / count,
                };
            } else if (this.history.length > 0) {
                 averaged[i] = this.history[this.history.length-1][i]; // fallback
            }
        }
        return averaged;
    }
}


export class SitupCounter {
    private state: SitupState = 'down';
    private repCount: number = 0;
    private onRepCountChange: (count: number) => void;
    public errors: Set<FormError> = new Set();
    
    private landmarks: Landmark[] = [];
    private smoother: LandmarkSmoother;


    constructor(onRepCountChange: (count: number) => void) {
        this.onRepCountChange = onRepCountChange;
        this.smoother = new LandmarkSmoother(3); // Smooth over 3 frames
    }

    private getAngle(p1: Landmark, p2: Landmark, p3: Landmark): number {
        const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
        let result = Math.abs(angle * 180.0 / Math.PI);
        if (result > 180) {
            result = 360 - result;
        }
        return result;
    }
    
    private isBodyVisible(): boolean {
        if (!this.landmarks || this.landmarks.length === 0) return false;
        // Require shoulder, hip, and knee of one side to be visible.
        const leftSideVisible =
            this.landmarks[11] && this.landmarks[11].visibility! > 0.6 &&
            this.landmarks[23] && this.landmarks[23].visibility! > 0.6 &&
            this.landmarks[25] && this.landmarks[25].visibility! > 0.6;

        const rightSideVisible =
            this.landmarks[12] && this.landmarks[12].visibility! > 0.6 &&
            this.landmarks[24] && this.landmarks[24].visibility! > 0.6 &&
            this.landmarks[26] && this.landmarks[26].visibility! > 0.6;
        
        return leftSideVisible || rightSideVisible;
    }

    private isSideView(): boolean {
        if (!this.isBodyVisible()) return false;
        const leftShoulder = this.landmarks[11];
        const rightShoulder = this.landmarks[12];
        
        // If both shoulders are visible, check how far apart they are on the x-axis.
        // If they are far apart, it's likely a front-on view.
        if (leftShoulder?.visibility! > 0.6 && rightShoulder?.visibility! > 0.6) {
             const shoulderXDiff = Math.abs(leftShoulder.x - rightShoulder.x);
             // If shoulders are more than 15% of the frame width apart, it's not a side view.
             if (shoulderXDiff > 0.15) return false;
        }
        
        return true;
    }

    public process(landmarks: Landmark[][]) {
        this.errors.clear();
        if (!landmarks || landmarks.length === 0 || !landmarks[0]) {
            this.errors.add(FormError.BODY_NOT_VISIBLE);
            return { repCount: this.repCount, errors: this.errors };
        }
        
        this.landmarks = this.smoother.add(landmarks[0]);
        
        if (!this.isBodyVisible()) {
            this.errors.add(FormError.BODY_NOT_VISIBLE);
            return { repCount: this.repCount, errors: this.errors };
        }
        
        if (!this.isSideView()) {
            this.errors.add(FormError.BAD_CAMERA_ANGLE);
            return { repCount: this.repCount, errors: this.errors };
        }
        
        const leftHipVisible = (this.landmarks[23]?.visibility ?? 0) > 0.6;
        const leftShoulderVisible = (this.landmarks[11]?.visibility ?? 0) > 0.6;
        const leftKneeVisible = (this.landmarks[25]?.visibility ?? 0) > 0.6;

        let shoulder, hip, knee;

        // Prioritize left side if visible, otherwise use right side.
        if (leftHipVisible && leftShoulderVisible && leftKneeVisible) {
            shoulder = this.landmarks[11];
            hip = this.landmarks[23];
            knee = this.landmarks[25];
        } else if (this.landmarks[24]?.visibility! > 0.6 && this.landmarks[12]?.visibility! > 0.6 && this.landmarks[26]?.visibility! > 0.6) {
            shoulder = this.landmarks[12];
            hip = this.landmarks[24];
            knee = this.landmarks[26];
        } else {
            this.errors.add(FormError.BODY_NOT_VISIBLE);
            return { repCount: this.repCount, errors: this.errors };
        }

        const hipAngle = this.getAngle(shoulder, hip, knee);

        // Logic for counting reps: Count on the way UP
        if (this.state === 'down' && hipAngle < 70) { // Person is in the 'up' position
            this.state = 'up';
            this.repCount++;
            this.onRepCountChange(this.repCount);
            this.errors.delete(FormError.INCOMPLETE_REP_DOWN);
        } else if (this.state === 'up' && hipAngle > 120) { // Person is back in the 'down' position (more forgiving angle)
            this.state = 'down';
            this.errors.delete(FormError.INCOMPLETE_REP_UP);
        }

        // Persistent form validation based on current state
        if (this.state === 'up' && hipAngle > 80) { // If going down but not far enough
            this.errors.add(FormError.INCOMPLETE_REP_DOWN);
        }
        if (this.state === 'down' && hipAngle < 110) { // If coming up but not far enough
            this.errors.add(FormError.INCOMPLETE_REP_UP);
        }
        
        return { repCount: this.repCount, errors: this.errors };
    }
}
