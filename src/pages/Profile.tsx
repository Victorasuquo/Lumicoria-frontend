import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Icons } from '../components/ui/icons';
import { userApi, UserProfile, UserSettings } from '../services/api';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Form states
  const [profileForm, setProfileForm] = useState({
    job_title: '',
    company: '',
    timezone: '',
    preferred_language: '',
  });

  const [settingsForm, setSettingsForm] = useState({
    email_notifications: true,
    push_notifications: true,
    task_reminders: true,
    break_reminders: true,
    work_hours_start: '09:00',
    work_hours_end: '17:00',
    break_interval_minutes: 60,
    break_duration_minutes: 15,
    preferred_ai_model: 'gpt-4',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, settingsData] = await Promise.all([
          userApi.getUserProfile(),
          userApi.getUserSettings(),
        ]);
        setProfile(profileData);
        setSettings(settingsData);
        setProfileForm({
          job_title: profileData.job_title || '',
          company: profileData.company || '',
          timezone: profileData.timezone,
          preferred_language: profileData.preferred_language,
        });
        setSettingsForm({
          email_notifications: settingsData.email_notifications,
          push_notifications: settingsData.push_notifications,
          task_reminders: settingsData.task_reminders,
          break_reminders: settingsData.break_reminders,
          work_hours_start: settingsData.work_hours_start,
          work_hours_end: settingsData.work_hours_end,
          break_interval_minutes: settingsData.break_interval_minutes,
          break_duration_minutes: settingsData.break_duration_minutes,
          preferred_ai_model: settingsData.preferred_ai_model,
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [toast]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedProfile = await userApi.updateUserProfile(profileForm);
      setProfile(updatedProfile);
      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedSettings = await userApi.updateUserSettings(settingsForm);
      setSettings(updatedSettings);
      toast({
        title: 'Success',
        description: 'Settings updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const updatedUser = await userApi.uploadAvatar(file);
      toast({
        title: 'Success',
        description: 'Avatar updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettingsForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (!user) return null;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
            <AvatarFallback>{user.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.full_name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
                disabled={isLoading}
              />
              <label htmlFor="avatar-upload">
                <Button variant="outline" size="sm" asChild>
                  <span>Change Avatar</span>
                </Button>
              </label>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        name="job_title"
                        value={profileForm.job_title}
                        onChange={handleProfileChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={profileForm.company}
                        onChange={handleProfileChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        name="timezone"
                        value={profileForm.timezone}
                        onChange={handleProfileChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferred_language">Preferred Language</Label>
                      <Input
                        id="preferred_language"
                        name="preferred_language"
                        value={profileForm.preferred_language}
                        onChange={handleProfileChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="email_notifications"
                          name="email_notifications"
                          checked={settingsForm.email_notifications}
                          onChange={handleSettingsChange}
                          disabled={isLoading}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="email_notifications">Email Notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="push_notifications"
                          name="push_notifications"
                          checked={settingsForm.push_notifications}
                          onChange={handleSettingsChange}
                          disabled={isLoading}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="push_notifications">Push Notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="task_reminders"
                          name="task_reminders"
                          checked={settingsForm.task_reminders}
                          onChange={handleSettingsChange}
                          disabled={isLoading}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="task_reminders">Task Reminders</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="break_reminders"
                          name="break_reminders"
                          checked={settingsForm.break_reminders}
                          onChange={handleSettingsChange}
                          disabled={isLoading}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="break_reminders">Break Reminders</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Work Schedule</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="work_hours_start">Work Hours Start</Label>
                        <Input
                          type="time"
                          id="work_hours_start"
                          name="work_hours_start"
                          value={settingsForm.work_hours_start}
                          onChange={handleSettingsChange}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="work_hours_end">Work Hours End</Label>
                        <Input
                          type="time"
                          id="work_hours_end"
                          name="work_hours_end"
                          value={settingsForm.work_hours_end}
                          onChange={handleSettingsChange}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Break Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="break_interval_minutes">Break Interval (minutes)</Label>
                        <Input
                          type="number"
                          id="break_interval_minutes"
                          name="break_interval_minutes"
                          value={settingsForm.break_interval_minutes}
                          onChange={handleSettingsChange}
                          disabled={isLoading}
                          min="15"
                          max="120"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="break_duration_minutes">Break Duration (minutes)</Label>
                        <Input
                          type="number"
                          id="break_duration_minutes"
                          name="break_duration_minutes"
                          value={settingsForm.break_duration_minutes}
                          onChange={handleSettingsChange}
                          disabled={isLoading}
                          min="5"
                          max="30"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">AI Preferences</h3>
                    <div className="space-y-2">
                      <Label htmlFor="preferred_ai_model">Preferred AI Model</Label>
                      <select
                        id="preferred_ai_model"
                        name="preferred_ai_model"
                        value={settingsForm.preferred_ai_model}
                        onChange={handleSettingsChange}
                        disabled={isLoading}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="claude-2">Claude 2</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 