import React from 'react';

const CakeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.75a.75.75 0 01-.75.75H3.75a.75.75 0 010-1.5h16.5a.75.75 0 01.75.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.625 15.75v-3.375a3.375 3.375 0 013.375-3.375h6a3.375 3.375 0 013.375 3.375v3.375" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v3.75a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75V6.75z" />
    </svg>
);

const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
    </svg>
);

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtext: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtext }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full">
            {icon}
        </div>
        <div className="overflow-hidden">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{title}</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">{value}</p>
            {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{subtext}</p>}
        </div>
    </div>
);

interface AdditionalStatsProps {
    oldestPerson: { name: string; age: number; } | null;
    avgLifespan: number;
    commonAddress: { address: string; count: number; } | null;
}

const AdditionalStats: React.FC<AdditionalStatsProps> = ({ oldestPerson, avgLifespan, commonAddress }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {oldestPerson && (
                <StatCard 
                    icon={<CakeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                    title="ყველაზე ხანდაზმული (ცოცხალი)"
                    value={`${oldestPerson.age} წლის`}
                    subtext={oldestPerson.name}
                />
            )}
            {avgLifespan > 0 && (
                <StatCard 
                    icon={<HeartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                    title="სიცოცხლის საშ. ხანგრძლივობა"
                    value={`${avgLifespan} წელი`}
                    subtext="(გარდაცვლილების მიხედვით)"
                />
            )}
            {commonAddress && (
                <StatCard 
                    icon={<HomeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                    title="ყველაზე გავრც. მისამართი"
                    value={`${commonAddress.count} ადამიანი`}
                    subtext={commonAddress.address}
                />
            )}
        </div>
    );
};

export default AdditionalStats;