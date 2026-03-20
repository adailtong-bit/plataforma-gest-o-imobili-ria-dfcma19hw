import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SubscriptionSettings } from '@/components/settings/SubscriptionSettings'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Shield, User, Bell, CreditCard, KeyRound } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function Settings() {
  const { currentUser, isAuthLoading } = useAuthStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [preferences, setPreferences] = useState({
    emailNotif: true,
    smsNotif: false,
    marketingEmails: false,
  })

  useEffect(() => {
    if (!isAuthLoading) {
      if (currentUser) {
        setProfileData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
        })
      }
      setTimeout(() => setIsLoading(false), 300)
    }
  }, [currentUser, isAuthLoading])

  const handleSaveProfile = () => {
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved successfully.',
    })
  }

  const handleSavePreferences = () => {
    toast({
      title: 'Preferences Saved',
      description:
        'Your notification and system preferences have been updated.',
    })
  }

  const handleSaveSecurity = () => {
    toast({
      title: 'Security Updated',
      description: 'Your security settings have been updated successfully.',
    })
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in p-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  const canViewSubscription =
    currentUser?.role === 'master' ||
    currentUser?.role === 'platform_owner' ||
    currentUser?.role === 'software_tenant'

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('sidebar.settings') || 'Settings'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-100 border border-slate-200">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
          >
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
          >
            <Bell className="h-4 w-4" /> Preferences
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
          >
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          {canViewSubscription && (
            <TabsTrigger
              value="subscription"
              className="data-[state=active]:bg-white data-[state=active]:text-black gap-2"
            >
              <CreditCard className="h-4 w-4" /> Subscription
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-slate-100">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback className="text-xl bg-slate-100 font-bold">
                    {profileData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="border-slate-300">
                  Change Avatar
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email Address</Label>
                  <Input
                    value={profileData.email}
                    disabled
                    className="bg-slate-50 cursor-not-allowed"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-slate-50/50 py-4 flex justify-end">
              <Button
                onClick={handleSaveProfile}
                className="bg-trust-blue text-white font-bold"
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground font-medium">
                      Receive updates via email.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotif}
                    onCheckedChange={(c) =>
                      setPreferences({ ...preferences, emailNotif: c })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground font-medium">
                      Receive important alerts via text message.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.smsNotif}
                    onCheckedChange={(c) =>
                      setPreferences({ ...preferences, smsNotif: c })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">
                      Marketing Emails
                    </Label>
                    <p className="text-sm text-muted-foreground font-medium">
                      Receive news and promotional offers.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketingEmails}
                    onCheckedChange={(c) =>
                      setPreferences({ ...preferences, marketingEmails: c })
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-slate-50/50 py-4 flex justify-end">
              <Button
                onClick={handleSavePreferences}
                className="bg-trust-blue text-white font-bold"
              >
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security protocols.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 max-w-md">
                <div className="grid gap-2">
                  <Label className="font-bold">Current Password</Label>
                  <Input type="password" />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold">New Password</Label>
                  <Input type="password" />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold">Confirm New Password</Label>
                  <Input type="password" />
                </div>
              </div>
              <div className="pt-6 mt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-muted-foreground font-medium">
                    Add an extra layer of security to your account.
                  </p>
                </div>
                <Button variant="outline" className="font-bold">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-slate-50/50 py-4 flex justify-end">
              <Button
                onClick={handleSaveSecurity}
                className="bg-trust-blue text-white font-bold"
              >
                Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {canViewSubscription && (
          <TabsContent value="subscription">
            <SubscriptionSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
