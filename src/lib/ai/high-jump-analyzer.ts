'use client';

import { Landmark } from "@mediapipe/tasks-vision";

export enum FormError {
    BODY_NOT_VISIBLE = 'BODY_NOT_VISIBLE',
    BAD_CAMERA_ANGLE = 'BAD_CAMERA_ANGLE',
    NO_JUMP_DETECTED = 'NO_JUMP_DETECTED',
}

export const VALIDATION_ERROR_MESSAGES: Record<FormError, string> = {
    [FormError.BODY_NOT_VISIBLE]: "Your full body is not visible. Please reposition.",
    [FormError.BAD_CAMERA_ANGLE]: "Please position the camera for a full-body side view.",
    [FormError.NO_JUMP_DETECTED]: "No jump was detected. Make sure to jump within the frame.",
}

type JumpState = 'ready' | 'jumping' | 'landed' | 'cooldown';

export class HighJumpAnalyzer {
    private state: JumpState = 'ready';
    private onHeightChange: (height: number) => void;
    public errors: Set<FormError> = new Set();
    
    private landmarks: Landmark[] = [];
    private athleteHeightCm: number;
    private pixelToCmRatio: number | null = null;
    private groundLevel: number | null = null;
    private maxJumpY: number | null = null;
    private lastJumpHeight: number = 0;
    private cooldownTimer: NodeJS.Timeout | null = null;

    constructor(onHeightChange: (height: number) => void, athleteHeightCm: number) {
        this.onHeightChange = onHeightChange;
        this.athleteHeightCm = athleteHeightCm;
    }
    
    private isBodyVisible(): boolean {
        // We need feet and hips for this one
        const required = [0, 23, 24, 31, 32]; // Head, Hips and Feet
        for (const index of required) {
            if (!this.landmarks[index] || this.landmarks[index].visibility! < 0.7) {
                return false;
            }
        }
        return true;
    }

    private calibrate() {
        if (!this.isBodyVisible() || this.pixelToCmRatio) return;

        const head = this.landmarks[0];
        const leftFoot = this.landmarks[31];
        const rightFoot = this.landmarks[32];
        const footY = (leftFoot.y + rightFoot.y) / 2;

        const bodyHeightInPixels = Math.abs(footY - head.y);
        
        if(bodyHeightInPixels > 0.3) { // Ensure there is enough vertical separation
            this.pixelToCmRatio = this.athleteHeightCm / bodyHeightInPixels;
            this.groundLevel = footY;
        }
    }

    private prepareForNextJump() {
        this.state = 'cooldown';
        this.maxJumpY = null;
        if (this.cooldownTimer) clearTimeout(this.cooldownTimer);
        this.cooldownTimer = setTimeout(() => {
            this.state = 'ready';
            // Do NOT reset lastJumpHeight here, so it persists until the whole test is reset
        }, 2000); // 2-second cooldown before a new jump can be started
    }

    public process(landmarks: Landmark[][]) {
        this.errors.clear();
        if (!landmarks || landmarks.length === 0) {
            this.errors.add(FormError.BODY_NOT_VISIBLE);
            return { errors: this.errors };
        }
        
        this.landmarks = landmarks[0];
        
        if (!this.isBodyVisible()) {
            this.errors.add(FormError.BODY_NOT_VISIBLE);
            return { errors: this.errors };
        }

        if (!this.pixelToCmRatio || !this.groundLevel) {
            this.calibrate();
             if (!this.pixelToCmRatio) {
                this.errors.add(FormError.BAD_CAMERA_ANGLE);
                return { errors: this.errors };
            }
        }

        // Always get the lowest foot y-coordinate
        const currentFeetY = Math.max(this.landmarks[31].y, this.landmarks[32].y);
        
        // Handle jump states
        if (this.state === 'ready' && currentFeetY < this.groundLevel - 0.05) { // Started jump
            this.state = 'jumping';
            this.maxJumpY = currentFeetY; // Initialize max jump Y
        } else if (this.state === 'jumping') {
            // Update max jump height if athlete goes higher
            if (currentFeetY < this.maxJumpY!) {
                this.maxJumpY = currentFeetY;
            }

            // Check for landing
            if (currentFeetY >= this.groundLevel - 0.05) {
                this.state = 'landed';
                if (this.pixelToCmRatio && this.maxJumpY && this.groundLevel) {
                    const jumpHeightInPixels = this.groundLevel - this.maxJumpY;
                    const jumpHeightInCm = jumpHeightInPixels * this.pixelToCmRatio;
                    
                    if (jumpHeightInCm > 10) { // Simple validation
                        this.lastJumpHeight = Math.max(this.lastJumpHeight, jumpHeightInCm);
                        this.onHeightChange(this.lastJumpHeight); // Update with the new max height
                    } else {
                        this.errors.add(FormError.NO_JUMP_DETECTED);
                    }
                }
                this.prepareForNextJump(); // Start cooldown to reset for next jump
            }
        }
        
        // If we are not actively jumping but have a recorded height, keep showing it.
        if (this.state !== 'jumping' && this.lastJumpHeight > 0) {
             this.onHeightChange(this.lastJumpHeight);
        }

        return { errors: this.errors };
    }
}
