import { badges } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NoviceBadge } from '../icons/badges/novice-badge';
import { AdeptBadge } from '../icons/badges/adept-badge';
import { ExpertBadge } from '../icons/badges/expert-badge';
import { MasterBadge } from '../icons/badges/master-badge';
import { GrandmasterBadge } from '../icons/badges/grandmaster-badge';
import type { ElementType } from 'react';
import { cn } from '@/lib/utils';
import { AscendantBadge } from '../icons/badges/ascendant-badge';
import { CelestialBadge } from '../icons/badges/celestial-badge';
import { DivineBadge } from '../icons/badges/divine-badge';
import { LegendBadge } from '../icons/badges/legend-badge';
import { MythicBadge } from '../icons/badges/mythic-badge';


const badgeIcons: { [key: string]: ElementType } = {
    NoviceBadge,
    AdeptBadge,
    ExpertBadge,
    MasterBadge,
    GrandmasterBadge,
    LegendBadge,
    MythicBadge,
    CelestialBadge,
    DivineBadge,
    AscendantBadge,
};

const tierColors: { [key: number]: string } = {
    1: 'border-stone-400/80 bg-stone-400/20 text-stone-300', // Novice (Stone)
    2: 'border-yellow-500/80 bg-yellow-500/20 text-yellow-300', // Adept (Gold)
    3: 'border-sky-500/80 bg-sky-500/20 text-sky-300', // Expert (Sky)
    4: 'border-purple-500/80 bg-purple-500/20 text-purple-300', // Master (Purple)
    5: 'border-red-500/80 bg-red-500/20 text-red-300', // Grandmaster (Red)
    6: 'border-emerald-500/80 bg-emerald-500/20 text-emerald-300', // Legend (Emerald)
    7: 'border-rose-500/80 bg-rose-500/20 text-rose-300', // Mythic (Rose)
    8: 'border-cyan-400/80 bg-cyan-400/20 text-cyan-200', // Celestial (Cyan)
    9: 'border-amber-300/80 bg-amber-300/20 text-amber-200', // Divine (Amber)
    10: 'border-white/80 bg-white/20 text-white', // Ascendant (White)
}

export default function BadgeList() {
    const earnedBadges = badges;

    return (
        <TooltipProvider>
            <div className="flex flex-wrap gap-4">
                {earnedBadges.map((badge, index) => {
                    const Icon = badgeIcons[badge.icon];
                    const colorClasses = tierColors[badge.tier] || tierColors[1];
                    if (!Icon) return null;

                    return (
                        <Tooltip key={badge.name}>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "relative flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 p-2 transition-all hover:scale-105",
                                    colorClasses
                                    )}>
                                    <Icon className="h-8 w-8" />
                                    <p className="mt-1 text-center text-xs font-semibold">{badge.name}</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">{badge.name}</p>
                                <p className="text-sm text-muted-foreground">{badge.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}
