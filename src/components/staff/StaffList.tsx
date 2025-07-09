
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Phone,
  Mail,
  Edit2,
  Calendar,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { StaffMember } from '@/services/staffService';

const roleColors = {
  Manager: 'bg-purple-500',
  Serveur: 'bg-blue-500',
  Cuisinier: 'bg-green-500',
  Plongeur: 'bg-orange-500'
};

const statusConfig = {
  active: { label: 'Actif', color: 'bg-green-500', textColor: 'text-green-700' },
  inactive: { label: 'Inactif', color: 'bg-gray-500', textColor: 'text-gray-700' },
  vacation: { label: 'En congé', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  terminated: { label: 'Licencié', color: 'bg-red-500', textColor: 'text-red-700' }
};

interface StaffListProps {
  filteredStaff: StaffMember[];
}

const formatSalaryFCFA = (salary: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(salary) + ' FCFA';
};

export const StaffList: React.FC<StaffListProps> = ({ filteredStaff }) => {
  const getInitials = (member: StaffMember) => {
    return `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (filteredStaff.length === 0) {
    return (
      <Card className="bg-white border-emerald-100">
        <CardContent className="p-12 text-center">
          <Users className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-emerald-600 mb-2">Aucun employé trouvé</h3>
          <p className="text-emerald-500">Aucun employé ne correspond à vos critères de recherche.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredStaff.map((member) => {
        const statusConf = statusConfig[member.status as keyof typeof statusConfig] || statusConfig.active;
        const roleColor = roleColors[member.position as keyof typeof roleColors] || 'bg-gray-500';
        
        return (
          <Card key={member.id} className="bg-white border-emerald-100 hover:border-emerald-300 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={member.avatar_url || undefined} alt={`${member.first_name} ${member.last_name}`} />
                    <AvatarFallback className={`${roleColor} text-white font-bold`}>
                      {getInitials(member)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-emerald-800">{member.first_name} {member.last_name}</h3>
                      <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                        {member.position}
                      </Badge>
                      <Badge className={cn("text-white", statusConf.color)}>
                        {statusConf.label}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      {member.email && (
                        <div className="flex items-center text-sm text-emerald-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {member.email}
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center text-sm text-emerald-600">
                          <Phone className="w-3 h-3 mr-1" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-emerald-500 mt-1">
                      Embauché le {new Date(member.hire_date).toLocaleDateString('fr-FR')} • N° {member.employee_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-emerald-600">Performance</p>
                    <p className={cn("text-lg font-bold", getPerformanceColor(85))}>
                      85%
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-emerald-600">Heures/semaine</p>
                    <p className="text-lg font-bold text-emerald-800">0h</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-emerald-600">Tâches</p>
                    <p className="text-lg font-bold text-emerald-800">0</p>
                  </div>

                  {member.salary && (
                    <div className="text-center">
                      <p className="text-sm text-emerald-600">Salaire</p>
                      <p className="text-lg font-bold text-emerald-800">{formatSalaryFCFA(member.salary)}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-600">
                        <Users className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Profil de {member.first_name} {member.last_name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={member.avatar_url || undefined} alt={`${member.first_name} ${member.last_name}`} />
                            <AvatarFallback className={`${roleColor} text-white font-bold text-lg`}>
                              {getInitials(member)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-bold text-emerald-800">{member.first_name} {member.last_name}</h3>
                            <p className="text-emerald-600">{member.position}</p>
                            <Badge className={cn("text-white mt-1", statusConf.color)}>
                              {statusConf.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-emerald-700 mb-3">Informations personnelles</h4>
                            <div className="space-y-2">
                              {member.email && (
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 text-emerald-500 mr-2" />
                                  <span className="text-emerald-600">{member.email}</span>
                                </div>
                              )}
                              {member.phone && (
                                <div className="flex items-center">
                                  <Phone className="w-4 h-4 text-emerald-500 mr-2" />
                                  <span className="text-emerald-600">{member.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-emerald-500 mr-2" />
                                <span className="text-emerald-600">
                                  Embauché le {new Date(member.hire_date).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 text-emerald-500 mr-2" />
                                <span className="text-emerald-600">N° employé: {member.employee_number}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-emerald-700 mb-3">Performances</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-emerald-600">Performance générale</span>
                                  <span className={getPerformanceColor(85)}>
                                    85%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{ width: '85%' }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-emerald-600">Heures cette semaine</span>
                                <span className="font-medium text-emerald-800">0h</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-emerald-600">Tâches complétées</span>
                                <span className="font-medium text-emerald-800">0</span>
                              </div>
                              {member.salary && (
                                <div className="flex justify-between">
                                  <span className="text-emerald-600">Salaire mensuel</span>
                                  <span className="font-medium text-emerald-800">{formatSalaryFCFA(member.salary)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-600">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
