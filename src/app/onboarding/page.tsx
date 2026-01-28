'use client';

import React, { useState, useEffect } from 'react';
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
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  academic: z.object({
    educationLevel: z.string().min(1, "Please select your education level."),
    degree: z.string().min(1, "Please enter your degree."),
    graduationYear: z.string().min(4, "Please enter a valid year."),
    gpa: z.string().optional(),
  }),
  studyGoal: z.object({
    intendedDegree: z.string().min(1, "Please select your intended degree."),
    fieldOfStudy: z.string().min(1, "Please enter your field of study."),
    targetIntakeYear: z.string().min(4, "Please select a year."),
    preferredCountries: z.string().min(2, "Please enter at least one country."),
  }),
  budget: z.object({
    budgetRangePerYear: z.string().min(1, "Please select a budget range."),
    fundingType: z.string().min(1, "Please select a funding type."),
  }),
  readiness: z.object({
    ieltsStatus: z.string().min(1, "Please select your IELTS/TOEFL status."),
    greStatus: z.string().min(1, "Please select your GRE/GMAT status."),
    sopStatus: z.string().min(1, "Please select your SOP status."),
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const steps = [
  { id: 'Step 1', name: 'Academic Background', fields: ['academic'] },
  { id: 'Step 2', name: 'Study Goals', fields: ['studyGoal'] },
  { id: 'Step 3', name: 'Financials & Readiness', fields: ['budget', 'readiness'] },
];

const degreeOptions = [
    { value: 'Diploma', label: 'Diploma' },
    { value: 'ITI', label: 'ITI' },
    { value: 'B.Tech / B.E', label: 'B.Tech / B.E (Bachelor of Technology / Engineering)' },
    { value: 'B.Sc', label: 'B.Sc (Bachelor of Science)' },
    { value: 'B.Com', label: 'B.Com (Bachelor of Commerce)' },
    { value: 'B.A', label: 'B.A (Bachelor of Arts)' },
    { value: 'BCA', label: 'BCA (Bachelor of Computer Applications)' },
    { value: 'BBA', label: 'BBA (Bachelor of Business Administration)' },
    { value: 'MBBS', label: 'MBBS' },
    { value: 'B.Pharm', label: 'B.Pharm' },
    { value: 'LLB', label: 'LLB' },
    { value: 'M.Tech / M.E', label: 'M.Tech / M.E (Master of Technology / Engineering)' },
    { value: 'M.Sc', label: 'M.Sc (Master of Science)' },
    { value: 'M.Com', label: 'M.Com (Master of Commerce)' },
    { value: 'M.A', label: 'M.A (Master of Arts)' },
    { value: 'MCA', label: 'MCA (Master of Computer Applications)' },
    { value: 'MBA', label: 'MBA (Master of Business Administration)' },
    { value: 'M.Pharm', label: 'M.Pharm' },
    { value: 'LLM', label: 'LLM' },
    { value: 'PhD / Doctorate', label: 'PhD / Doctorate' },
    { value: 'Post Graduate Diploma', label: 'Post Graduate Diploma (PGDM / PGD)' },
    { value: 'Integrated Degree', label: 'Integrated Degree' },
];
const degreeOptionValues = degreeOptions.map(o => o.value);

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [previousStep, setPreviousStep] = useState(0);
  const { user, updateProfile, loading } = useAuth();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      academic: {
        educationLevel: '',
        degree: '',
        graduationYear: '',
        gpa: '',
      },
      studyGoal: {
        intendedDegree: '',
        fieldOfStudy: '',
        targetIntakeYear: '2025',
        preferredCountries: '',
      },
      budget: {
        budgetRangePerYear: '',
        fundingType: '',
      },
      readiness: {
        ieltsStatus: '',
        greStatus: '',
        sopStatus: '',
      },
    },
  });

  const [showOtherDegreeInput, setShowOtherDegreeInput] = useState(() => {
    const initialDegree = form.getValues('academic.degree');
    return !!initialDegree && !degreeOptionValues.includes(initialDegree);
  });
  
  useEffect(() => {
    if (user?.onboardingComplete) {
      router.push('/dashboard');
    }
  }, [user, router]);


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

  function onSubmit(data: ProfileFormValues) {
    const { studyGoal, ...rest } = data;
    const profileData: UserProfile = {
      ...rest,
      studyGoal: {
        ...studyGoal,
        preferredCountries: studyGoal.preferredCountries.split(',').map(s => s.trim()),
      }
    };
    updateProfile(profileData);
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
                      <FormField name="academic.educationLevel" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Highest Level of Education</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="bachelors">Bachelor's Degree</SelectItem><SelectItem value="masters">Master's Degree</SelectItem><SelectItem value="phd">PhD</SelectItem></SelectContent>
                          </Select><FormMessage />
                        </FormItem>
                      )}/>
                      <FormField
                        name="academic.degree"
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
                        <FormField name="academic.graduationYear" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Graduation Year</FormLabel><FormControl><Input placeholder="e.g., 2023" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="academic.gpa" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>GPA (Optional)</FormLabel><FormControl><Input placeholder="e.g., 3.8 / 4.0" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                     <div className="space-y-4">
                        <FormField name="studyGoal.intendedDegree" control={form.control} render={({ field }) => (
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
                        <FormField name="studyGoal.fieldOfStudy" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input placeholder="e.g., Artificial Intelligence, Data Science" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="studyGoal.targetIntakeYear" control={form.control} render={({ field }) => (
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
                        <FormField name="studyGoal.preferredCountries" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Preferred Countries (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., USA, Canada, UK" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                     </div>
                  )}
                  
                  {currentStep === 2 && (
                    <div className="space-y-6">
                        <FormField name="budget.budgetRangePerYear" control={form.control} render={({ field }) => (
                            <FormItem className="space-y-3"><FormLabel>Budget Range Per Year</FormLabel><FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="<20k" /></FormControl><FormLabel className="font-normal">&lt; $20,000</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="20k-40k" /></FormControl><FormLabel className="font-normal">$20k - $40k</FormLabel></FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value=">40k" /></FormControl><FormLabel className="font-normal">&gt; $40,000</FormLabel></FormItem>
                                </RadioGroup>
                            </FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField name="budget.fundingType" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Funding Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="self-funded">Self-funded</SelectItem><SelectItem value="scholarship-dependent">Scholarship-dependent</SelectItem><SelectItem value="loan-dependent">Loan-dependent</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                            <FormField name="readiness.sopStatus" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>SOP Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Not started">Not Started</SelectItem><SelectItem value="Draft">Draft</SelectItem><SelectItem value="Ready">Ready</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                             <FormField name="readiness.ieltsStatus" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>IELTS/TOEFL Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Not started">Not Started</SelectItem><SelectItem value="In progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                            )}/>
                            <FormField name="readiness.greStatus" control={form.control} render={({ field }) => (
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
          <Button type="button" variant="ghost" onClick={prev} disabled={currentStep === 0 || loading}>
            Back
          </Button>
          {currentStep === steps.length - 1 ? (
             <Button type="button" onClick={form.handleSubmit(onSubmit)} className="font-semibold" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Unlock Dashboard
             </Button>
          ) : (
            <Button type="button" onClick={next} className="font-semibold" disabled={loading}>Next Step</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
