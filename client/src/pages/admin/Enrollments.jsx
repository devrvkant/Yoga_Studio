import { useGetUsersQuery } from '../../features/auth/authApi';
import { Loader2, Mail, User, Book, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Enrollments = () => {
    const { data: usersData, isLoading, error } = useGetUsersQuery();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                Error loading users: {error.message || 'Unknown error'}
            </div>
        );
    }

    const users = usersData?.data || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground">User Enrollments</h1>
                <p className="text-muted-foreground mt-1">Manage and view all registered users and their subscriptions</p>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Enrolled Classes</th>
                                <th className="px-6 py-4">Enrolled Courses</th>
                                <th className="px-6 py-4">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-foreground">{user.name}</div>
                                                <div className="text-muted-foreground text-xs flex items-center gap-1">
                                                    <Mail size={10} /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.enrolledClasses?.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {user.enrolledClasses.map(cls => (
                                                    <div key={cls._id} className="flex items-center gap-1 text-xs bg-secondary/30 px-2 py-1 rounded">
                                                        <Calendar size={12} className="text-primary" />
                                                        <span className="truncate max-w-[150px]">{cls.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic">None</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.enrolledCourses?.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {user.enrolledCourses.map(course => (
                                                    <div key={course._id} className="flex items-center gap-1 text-xs bg-secondary/30 px-2 py-1 rounded">
                                                        <Book size={12} className="text-primary" />
                                                        <span className="truncate max-w-[150px]">{course.title}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground italic">None</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Enrollments;
