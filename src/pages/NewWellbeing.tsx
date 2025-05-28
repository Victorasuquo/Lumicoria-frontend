import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, LineChart, CircularProgress } from '@/components/ui/charts';
import {
  Heart,
  Coffee,
  Timer,
  Activity,
  Brain,
  Droplets,
  Calendar,
  CheckCircle,
  ArrowRight,
  Clock,
  BatteryMedium,
  BarChart2,
  ArrowUp,
  ArrowDown,
  MoveUp,
  BrainCircuit,
  Zap,
  PlayCircle,
  AlarmClock,
  Dumbbell,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { 
  wellbeingApi, 
  WellbeingMetric,
  WellbeingGoal,
  WellbeingRecommendation
} from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Sample data for the wellbeing dashboard
// In a real app, this would come from the API
const wellbeingMetrics = [
  {
    title: 'Focus Score',
    value: 85,
    icon: BrainCircuit,
    description: 'Based on deep work sessions and task completion',
    trend: 'up',
    change: '+5%'
  },
  {
    title: 'Energy Level',
    value: 72,
    icon: Zap,
    description: 'Combined mental and physical energy tracking',
    trend: 'stable',
    change: '0%'
  },
  {
    title: 'Break Balance',
    value: 60,
    icon: Coffee,
    description: 'Optimal work-break ratio throughout your day',
    trend: 'down',
    change: '-3%'
  },
  {
    title: 'Activity Score',
    value: 75,
    icon: Activity,
    description: 'Movement and posture throughout the day',
    trend: 'up',
    change: '+8%'
  }
];

const recommendations = [
  {
    title: 'Take a Focus Break',
    description: 'You\'ve been in deep work for 55 minutes. A short break will help maintain productivity.',
    icon: Timer,
    action: 'Start 5-min Break',
    priority: 'high',
    time: 'Now'
  },
  {
    title: 'Hydration Reminder',
    description: 'Water intake is below your target. Consider drinking a glass of water.',
    icon: Droplets,
    action: 'Log Water Intake',
    priority: 'medium',
    time: 'Within 30 min'
  },
  {
    title: 'Stretch Session',
    description: 'Try these exercises to reduce neck and shoulder tension from computer work.',
    icon: Activity,
    action: 'View Exercises',
    priority: 'medium',
    time: 'Within 1 hour'
  }
];

const goals = [
  {
    id: 'g1',
    title: 'Daily Deep Work',
    target: 4,
    current: 3.5,
    unit: 'hours',
    startDate: '2023-05-01',
    endDate: '2023-05-31',
    progress: 87.5,
    status: 'in-progress'
  },
  {
    id: 'g2',
    title: 'Break Consistency',
    target: 6,
    current: 4,
    unit: 'breaks',
    startDate: '2023-05-01',
    endDate: '2023-05-31',
    progress: 66.7,
    status: 'in-progress'
  },
  {
    id: 'g3',
    title: 'Daily Step Count',
    target: 8000,
    current: 7200,
    unit: 'steps',
    startDate: '2023-05-01',
    endDate: '2023-05-31',
    progress: 90,
    status: 'in-progress'
  },
  {
    id: 'g4',
    title: 'Water Intake',
    target: 8,
    current: 6,
    unit: 'glasses',
    startDate: '2023-05-01',
    endDate: '2023-05-31',
    progress: 75,
    status: 'in-progress'
  }
];

const activities = [
  {
    title: 'Focus Session',
    duration: '45 minutes',
    time: '9:30 AM',
    icon: BrainCircuit,
    color: 'purple'
  },
  {
    title: 'Break',
    duration: '10 minutes',
    time: '10:15 AM',
    icon: Coffee,
    color: 'green'
  },
  {
    title: 'Meditation',
    duration: '5 minutes',
    time: '11:30 AM',
    icon: Brain,
    color: 'blue'
  },
  {
    title: 'Walk',
    duration: '15 minutes',
    time: '12:45 PM',
    icon: Activity,
    color: 'orange'
  }
];

// Weekly trends data for charts
const weeklyData = {
  focus: [65, 70, 75, 82, 78, 85, 90],
  energy: [70, 65, 72, 68, 74, 72, 75],
  breaks: [65, 62, 68, 70, 65, 60, 65],
  steps: [5400, 6200, 7800, 6500, 7200, 8100, 7500]
};

const NewWellbeing = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchWellbeingData = async () => {
      try {
        setIsLoading(true);
        // In a real app, we would fetch the wellbeing data from the API
        // const metrics = await wellbeingApi.getMetrics();
        // const recommendations = await wellbeingApi.getRecommendations();
        // const goals = await wellbeingApi.getGoals();
        
        // For now, we're using the sample data
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching wellbeing data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load wellbeing data. Please try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };
    
    fetchWellbeingData();
  }, [toast]);

  const startBreak = () => {
    toast({
      title: 'Break Started',
      description: 'Your 5-minute break timer has started.',
      duration: 3000,
    });
    // In a real app, we would start the break timer
    // This would use the wellbeingApi.startBreak() method
  };
  
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <MoveUp className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Well-being Dashboard</h1>
          <p className="text-gray-600">
            Monitor your well-being metrics and get personalized recommendations
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="outline" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            May 2023
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <CheckCircle className="mr-2 h-4 w-4" />
            Check-in Now
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Well-being Metrics */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Today's Well-being Metrics</span>
                    <Badge variant="outline" className="text-purple-600 border-purple-600">Live</Badge>
                  </CardTitle>
                  <CardDescription>
                    Track your real-time well-being indicators and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {wellbeingMetrics.map((metric, index) => (
                      <div key={index} className="rounded-lg border p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-purple-100 rounded-md">
                              <metric.icon className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="font-medium text-gray-900">{metric.title}</h3>
                          </div>
                          <div className="flex items-center">
                            <span className="text-2xl font-bold text-purple-600 mr-2">
                              {metric.value}
                            </span>
                            <div className="flex items-center" title={metric.change}>
                              {getTrendIcon(metric.trend)}
                            </div>
                          </div>
                        </div>
                        <Progress value={metric.value} className="h-2 mb-2" />
                        <p className="text-xs text-gray-600">{metric.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Today's Activity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Activity Timeline</CardTitle>
                  <CardDescription>
                    Your well-being activities throughout the day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l border-gray-200 pl-6 ml-3">
                    {activities.map((activity, index) => (
                      <div key={index} className="mb-6 relative">
                        <div className={`absolute -left-9 h-6 w-6 rounded-full bg-${activity.color}-100 flex items-center justify-center`}>
                          <activity.icon className={`h-3 w-3 text-${activity.color}-600`} />
                        </div>
                        <time className="mb-1 text-sm font-normal leading-none text-gray-500">
                          {activity.time}
                        </time>
                        <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.duration}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Recommendations and Quick Actions */}
            <div className="space-y-8">
              {/* Recommendation Card */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                  <CardTitle>
                    <div className="flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-purple-600" />
                      AI Recommendations
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Personalized suggestions for your well-being
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-md bg-purple-100">
                            <rec.icon className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1">{rec.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(rec.priority)}`}>
                          {rec.time}
                        </span>
                        <Button 
                          className="text-purple-600"
                          variant="link" 
                          size="sm" 
                          onClick={rec.title.includes('Break') ? startBreak : undefined}
                        >
                          {rec.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Recommendations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Next Break Reminder */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Next Break</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <AlarmClock className="h-10 w-10 text-purple-600 mr-3" />
                      <div>
                        <h3 className="font-medium">15-minute break due</h3>
                        <p className="text-sm text-gray-600">Take a walk or stretch</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <PlayCircle className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Coming up in</span>
                      <span>10:23 AM (12 min)</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="grid grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Well-being Goals</CardTitle>
                    <CardDescription>Track your progress towards your well-being goals</CardDescription>
                  </div>
                  <Button>
                    Set New Goal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {goals.map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900">{goal.title}</h3>
                          <p className="text-sm text-gray-600">
                            Target: {goal.target} {goal.unit}
                          </p>
                        </div>
                        <Badge variant={goal.status === 'completed' ? 'success' : 'outline'}>
                          {goal.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{goal.current} / {goal.target} {goal.unit}</span>
                        </div>
                        <Progress value={goal.progress} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                        <span>Started: {goal.startDate}</span>
                        <span>Target: {goal.endDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Goal Trends</CardTitle>
                <CardDescription>Track your progress over time</CardDescription>
              </CardHeader>
              <CardContent>              <div className="h-80">
                  <BarChart 
                    data={[85, 60, 90, 75]}
                    labels={["Focus", "Breaks", "Hydration", "Activity"]}
                    colors={["#7C3AED", "#8B5CF6", "#9333EA", "#A855F7"]}
                    title="Weekly Goal Completion"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
                <CardDescription>Your well-being metrics over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>                <div className="h-80">
                  <LineChart 
                    data={weeklyData.focus}
                    labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
                    title="Focus Score Trend"
                    color="#7C3AED"
                  />
                </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
                <CardDescription>Breakdown of your daily activities</CardDescription>
              </CardHeader>
              <CardContent>                <div className="h-80 flex items-center justify-around">
                  <CircularProgress value={75} size={180} label="Focus Time" color="#7C3AED" />
                  <CircularProgress value={60} size={180} label="Break Balance" color="#8B5CF6" />
                  <CircularProgress value={85} size={180} label="Hydration" color="#A855F7" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Personalized analysis of your well-being patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-purple-900 mb-2">Focus Pattern Analysis</h3>
                    <p className="text-purple-800">
                      Your focus scores are consistently higher in the morning between 9 AM and 11 AM. 
                      Consider scheduling your most important tasks during this peak focus window.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Break Effectiveness</h3>
                    <p className="text-blue-800">
                      Short breaks (5-10 minutes) every 50-60 minutes seem to boost your productivity
                      more than longer, less frequent breaks. Your focus typically increases by 15-20%
                      after these short breaks.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-medium text-green-900 mb-2">Physical Activity Impact</h3>
                    <p className="text-green-800">
                      On days when you take a 15+ minute walk, your afternoon energy levels are
                      30% higher than on days without physical activity. Consider adding a midday
                      walk to your routine.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewWellbeing;
