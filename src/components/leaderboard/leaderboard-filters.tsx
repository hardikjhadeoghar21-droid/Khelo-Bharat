'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Filters {
  gender: string;
  age: string;
  sort: string;
}

interface LeaderboardFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export function LeaderboardFilters({ filters, setFilters }: LeaderboardFiltersProps) {
  const handleFilterChange = (key: keyof Filters) => (value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="sort">Sort By</Label>
        <Select value={filters.sort} onValueChange={handleFilterChange('sort')}>
          <SelectTrigger id="sort" className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rank-asc">Rank</SelectItem>
            <SelectItem value="score-desc">Score (High to Low)</SelectItem>
            <SelectItem value="age-asc">Age (Young to Old)</SelectItem>
            <SelectItem value="height-desc">Height (Tall to Short)</SelectItem>
            <SelectItem value="weight-asc">Weight (Light to Heavy)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="gender">Gender</Label>
        <Select value={filters.gender} onValueChange={handleFilterChange('gender')}>
          <SelectTrigger id="gender" className="w-[120px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="age">Age</Label>
        <Select value={filters.age} onValueChange={handleFilterChange('age')}>
          <SelectTrigger id="age" className="w-[150px]">
            <SelectValue placeholder="Age Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="18-20">18-20 years</SelectItem>
            <SelectItem value="21-23">21-23 years</SelectItem>
            <SelectItem value="24-25">24-25 years</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
