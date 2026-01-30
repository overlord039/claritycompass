'use client';

import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Settings, Edit, DollarSign, Target, GraduationCap, BookOpen } from 'lucide-react';
import { Logo } from './logo';
import Link from 'next/link';

export function Header() {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };
  
  const profile = user?.profile;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Logo />
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="sr-only">Settings</span>
            </Button>
            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user?.fullName}`} alt={user?.fullName || ''} />
                        <AvatarFallback>
                        {user?.fullName ? getInitials(user.fullName) : <UserIcon />}
                        </AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                        </p>
                    </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <UserIcon className="mr-2 h-4 w-4" />
                              <span>Profile</span>
                          </DropdownMenuItem>
                        </DialogTrigger>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Profile Details
                    </DialogTitle>
                    <DialogDescription>
                        This is a summary of your profile. To make changes, visit the edit profile page.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    {profile ? (
                        <>
                            {/* Academic Section */}
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /> Academic Background</h4>
                                <div className="space-y-1 text-sm ml-6">
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">Education Level:</strong> <span>{profile.academic.educationLevel}</span></div>
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">Degree:</strong> <span>{profile.academic.degree}</span></div>
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">Graduation Year:</strong> <span>{profile.academic.graduationYear}</span></div>
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">GPA:</strong> <span>{profile.academic.gpa || 'N/A'}</span></div>
                                </div>
                            </div>

                            {/* Study Goal Section */}
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Study Goals</h4>
                                <div className="space-y-1 text-sm ml-6">
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">Intended Degree:</strong> <span>{profile.studyGoal.intendedDegree}</span></div>
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">Field of Study:</strong> <span>{profile.studyGoal.fieldOfStudy}</span></div>
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">Target Intake:</strong> <span>{profile.studyGoal.targetIntakeYear}</span></div>
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">Preferred Countries:</strong> <span>{profile.studyGoal.preferredCountries.join(', ')}</span></div>
                                </div>
                            </div>

                            {/* Financial Section */}
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Financials</h4>
                                <div className="space-y-1 text-sm ml-6">
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">Budget/Year:</strong> <span>{profile.budget.budgetRangePerYear}</span></div>
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">Funding Type:</strong> <span>{profile.budget.fundingType}</span></div>
                                </div>
                            </div>

                            {/* Readiness Section */}
                            <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Readiness</h4>
                                <div className="space-y-1 text-sm ml-6">
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">IELTS/TOEFL:</strong> <span>{profile.readiness.ieltsStatus}</span></div>
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">GRE/GMAT:</strong> <span>{profile.readiness.greStatus}</span></div>
                                    <div className="flex"><strong className="text-muted-foreground w-32 flex-shrink-0">SOP:</strong> <span>{profile.readiness.sopStatus}</span></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-muted-foreground text-center">Your profile is not complete yet.</p>
                    )}
                </div>
                <DialogFooter>
                    <Button asChild type="button" variant="secondary">
                        <Link href="/onboarding">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                        </Link>
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </div>
    </header>
  );
}
