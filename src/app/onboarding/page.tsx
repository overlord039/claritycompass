'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Logo } from '@/components/logo';
import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  fullName: z.string().min(2),
  educationLevel: z.string().min(1),
  degree: z.string().min(1),
  graduationYear: z.string().min(4),
  gpa: z.string().optional(),
  intendedDegree: z.string().min(1),
  fieldOfStudy: z.string().min(1),
  targetIntakeYear: z.string().min(4),
  preferredCountries: z.string().min(1),
  budgetRangePerYear: z.string().min(1),
  fundingType: z.string().min(1),
  ieltsStatus: z.string().min(1),
  greStatus: z.string().min(1),
  sopStatus: z.string().min(1),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const steps = [
  { id: 'Step 1', name: 'Academic Background', fields: ['educationLevel', 'degree', 'graduationYear', 'gpa'] },
  { id: 'Step 2', name: 'Study Goals', fields: ['intendedDegree', 'fieldOfStudy', 'targetIntakeYear', 'preferredCountries'] },
  { id: 'Step 3', name: 'Financials & Readiness', fields: ['budgetRangePerYear', 'fundingType', 'ieltsStatus', 'greStatus', 'sopStatus'] },
];

const degreeOptions = [
    { value: 'Bachelor of Science', label: 'Bachelor of Science (B.S.)' },
    { value: 'Bachelor of Arts', label: 'Bachelor of Arts (B.A.)' },
    { value: 'Master of Science', label: 'Master of Science (M.S.)' },
    { value: 'Master of Business Administration', label: 'Master of Business Administration (MBA)' },
    { value: 'Doctor of Philosophy', label: 'Doctor of Philosophy (Ph.D.)' },
];
const degreeOptionValues = degreeOptions.map(o => o.value);

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(0);
  const { user, updateProfile } = useAuth();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      educationLevel: '',
      degree: '',
      graduationYear: '',
      gpa: '',
      intendedDegree: '',
      fieldOfStudy: '',
      targetIntakeYear: '2025',
      preferredCountries: '',
      budgetRangePerYear: '',
      fundingType: '',
      ieltsStatus: '',
      greStatus: '',
      sopStatus: '',
    },
  });

  const [showOtherDegreeInput, setShowOtherDegreeInput] = useState(() => {
    const initialDegree = form.getValues('degree');
    return !!initialDegree && !degreeOptionValues.includes(initialDegree);
  });


  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await form.trigger(fields as any, { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      setPreviousStep(currentStep);
      setCurrentStep(step => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep(step => step - 1);
    }
  };

  async function onSubmit(data: ProfileFormValues) {
    const { preferredCountries, ...rest } = data;
    const profileData = {
      ...rest,
      preferredCountries: preferredCountries.split(',').map(s => s.trim()),
    };
    updateProfile(profileData);
    router.push('/dashboard');
  }

  const delta = currentStep - previousStep;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="absolute top-6 left-6">
            <Logo />
        </div>
      <Card className="w-full max-w-2xl shadow-2xl backdrop-blur-lg bg-card/80">
        <CardHeader>
          <Progress value={((currentStep + 1) / steps.length) * 100} className="w-full h-2 mb-4" />
          <CardTitle className="font-headline">{steps[currentStep].name}</CardTitle>
          <CardDescription>This information helps us find the perfect universities for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: delta >= 0 ? '-50%' : '50%', opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {currentStep === 0 && (
                    <div className="space-y-4">
                      <FormField name="educationLevel" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Highest Level of Education</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="bachelors">Bachelor's Degree</SelectItem><SelectItem value="masters">Master's Degree</SelectItem><SelectItem value="phd">PhD</SelectItem></SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                      )}/>
                      <FormField
                        name="degree"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Degree Name</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                if (value === 'other') {
                                    setShowOtherDegreeInput(true);
                                    field.onChange('');
                                } else {
                                    setShowOtherDegreeInput(false);
                                    field.onChange(value);
                                }
                                }}
                                value={showOtherDegreeInput ? 'other' : field.value}
                            >
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your degree" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {degreeOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                                <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {showOtherDegreeInput && (
                                <FormControl>
                                <Input
                                    placeholder="Please specify your degree"
                                    {...field}
                                    className="mt-2"
                                />
                                </FormControl>
                            )}
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="graduationYear" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Graduation Year</FormLabel><FormControl><Input placeholder="e.g., 2023" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="gpa" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>GPA (Optional)</FormLabel><FormControl><Input placeholder="e.g., 3.8 / 4.0" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                     <div className="space-y-4">
                        <FormField name="intendedDegree" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Intended Degree</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="masters-science">Master of Science (MS)</SelectItem>
                                    <SelectItem value="masters-arts">Master of Arts (MA)</SelectItem>
                                    <SelectItem value="masters-mba">Master of Business Administration (MBA)</SelectItem>
                                    <SelectItem value="phd">Doctor of Philosophy (PhD)</SelectItem>
                                    <SelectItem value="post-grad-diploma">Post-Graduate Diploma</SelectItem>
                                    <SelectItem value="certificate">Graduate Certificate</SelectItem>
                                </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )}/>
                        <FormField name="fieldOfStudy" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input placeholder="e.g., Artificial Intelligence, Data Science" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="targetIntakeYear" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Target Intake Year</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2026">2026</SelectItem>
                                    <SelectItem value="2027">2027</SelectItem>
                                </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )}/>
                        <FormField name="preferredCountries" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Preferred Countries (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., USA, Canada, UK" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                     </div>
                  )}
                  
                  {currentStep === 2 && (
                    <div className="space-y-6">
                        <FormField name="budgetRangePerYear" control={form.control} render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>Budget Range Per Year</FormLabel><FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="<20k" /></FormControl><FormLabel className="font-normal">&lt; $20,000</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="20k-40k" /></FormControl><FormLabel className="font-normal">$20k - $40k</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value=">40k" /></FormControl><FormLabel className="font-normal">&gt; $40,000</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField name="fundingType" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Funding Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="self-funded">Self-funded</SelectItem><SelectItem value="scholarship-dependent">Scholarship-dependent</SelectItem><SelectItem value="loan-dependent">Loan-dependent</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                            <FormField name="sopStatus" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>SOP Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Not started">Not Started</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Ready">Ready</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                             <FormField name="ieltsStatus" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>IELTS/TOEFL Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Not started">Not Started</SelectItem><SelectItem value="In progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                            <FormField name="greStatus" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>GRE/GMAT Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Not started">Not Started</SelectItem><SelectItem value="In progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="ghost" onClick={prev} disabled={currentStep === 0}>
            Back
          </Button>
          {currentStep === steps.length - 1 ? (
             <Button type="button" onClick={form.handleSubmit(onSubmit)} className="font-semibold">Unlock Dashboard</Button>
          ) : (
            <Button type="button" onClick={next} className="font-semibold">Next Step</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
