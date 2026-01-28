import { Accordion } from '@/components/ui/accordion';
import { ProfileSummary } from './profile-summary';
import { ProfileStrength } from './profile-strength';
import { TodoList } from './todo-list';

export function InfoPanel() {
    return (
        <div className="space-y-4">
             <h2 className="text-2xl font-bold tracking-tight text-center font-headline">Your Control Center</h2>
            <Accordion type="multiple" defaultValue={['summary', 'strength', 'todo']} className="w-full space-y-4">
                <ProfileSummary />
                <ProfileStrength />
                <TodoList />
            </Accordion>
        </div>
    );
}
