'use client';

import { useAuth } from '@/providers/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Logo } from './logo';

const stages = [
    { id: 1, name: 'Build Profile' },
    { id: 2, name: 'Discover Universities' },
    { id: 3, name: 'Finalize Choices' },
    { id: 4, name: 'Prepare Applications' },
];

export function Header() {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const currentStageInfo = user ? stages.find(s => s.id === user.currentStage) : null;


  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 relative">
        <Logo />
        <div className="absolute left-1/2 -translate-x-1/2 text-sm text-muted-foreground hidden md:block">
            {currentStageInfo && (
                <span>
                    Stage {currentStageInfo.id} of {stages.length} &middot;{' '}
                    <span className="text-foreground font-medium">{currentStageInfo.name}</span>
                </span>
            )}
        </div>
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
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
