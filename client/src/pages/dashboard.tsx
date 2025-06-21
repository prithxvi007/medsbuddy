import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Plus,
  Pill
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMedications } from "@/hooks/use-medications";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { MedicationCard } from "@/components/medication-card";
import { AddMedicationModal } from "@/components/add-medication-modal";
import { CalendarView } from "@/components/calendar-view";

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  
  const { user, logout, isLoggedIn } = useAuth();
  const { medications, adherence, isLoading, isAdherenceLoading } = useMedications();

  // Redirect if not logged in
  if (!isLoggedIn) {
    setLocation("/auth");
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  // Get today's medications (simplified - in real app would filter by schedule)
  const todayMedications = medications;
  const todayCount = todayMedications.length;

  const navItems = [
    { id: "today", label: "Today's Schedule", icon: Calendar },
    { id: "medications", label: "All Medications", icon: Pill },
    { id: "adherence", label: "Adherence Report", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Patient Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`
                          w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg font-medium transition-colors
                          ${isActive 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Today's Medications</h3>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {isLoading ? <LoadingSpinner size="sm" /> : todayCount}
                  </div>
                  <p className="text-gray-600">scheduled for today</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Adherence Rate</h3>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {isAdherenceLoading ? <LoadingSpinner size="sm" /> : `${adherence?.adherenceRate || 0}%`}
                  </div>
                  <p className="text-gray-600">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Total Medications</h3>
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {isLoading ? <LoadingSpinner size="sm" /> : medications.length}
                  </div>
                  <p className="text-gray-600">active medications</p>
                </CardContent>
              </Card>
            </div>

            {/* Tab Content */}
            {activeTab === "today" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">Today's Schedule</CardTitle>
                    <Button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : todayMedications.length === 0 ? (
                    <div className="text-center py-8">
                      <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No medications yet</h3>
                      <p className="text-gray-600 mb-4">Add your first medication to get started</p>
                      <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayMedications.map((medication) => (
                        <MedicationCard key={medication.id} medication={medication} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "medications" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">All Medications</CardTitle>
                    <Button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : medications.length === 0 ? (
                    <div className="text-center py-8">
                      <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No medications added</h3>
                      <p className="text-gray-600 mb-4">Start by adding your medications</p>
                      <Button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {medications.map((medication) => (
                        <MedicationCard 
                          key={medication.id} 
                          medication={medication} 
                          canMarkAsTaken={false}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "adherence" && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Adherence Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isAdherenceLoading ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner size="lg" />
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="text-center p-6 bg-gray-50 rounded-lg">
                          <div className="text-4xl font-bold text-green-600 mb-2">
                            {adherence?.adherenceRate || 0}%
                          </div>
                          <p className="text-gray-600">Overall Adherence</p>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Expected:</span>
                            <span className="font-semibold">{adherence?.totalExpectedDoses || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Taken:</span>
                            <span className="font-semibold">{adherence?.totalTakenDoses || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Period:</span>
                            <span className="font-semibold">{adherence?.period || "Last 30 days"}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <CalendarView />
              </div>
            )}

            {activeTab === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-semibold">{user.firstName} {user.lastName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Username</p>
                          <p className="font-semibold">{user.username}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Role</p>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Preferences</h3>
                      <p className="text-gray-600">Settings and preferences will be available in future updates.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AddMedicationModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </div>
  );
}
