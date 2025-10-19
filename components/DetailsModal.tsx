import React from 'react';
import { Person, People } from '../types';

interface DetailsModalProps {
  person: Person | null;
  people: People;
  onClose: () => void;
  onEdit: (personId: string) => void;
  onDelete: (personId: string) => void;
  onNavigate: (personId: string) => void;
  onGoogleSearch: (person: Person) => void;
  onShowOnMap: (address: string) => void;
}

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const EmailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const AddressIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
);

const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'უცნობია';
    // Matches YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-');
        return `${d}.${m}.${y}`;
    }
    // Matches YYYY or other formats (already formatted in input)
    return dateStr;
};


const DetailsModal: React.FC<DetailsModalProps> = ({ person, people, onClose, onEdit, onDelete, onNavigate, onGoogleSearch, onShowOnMap }) => {
  if (!person) return null;

  const calculateAge = (birthDate?: string, deathDate?: string): number | null => {
    if (!birthDate) return null;
    const start = new Date(birthDate);
    const end = deathDate ? new Date(deathDate) : new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        // Fallback for only year being present if new Date() fails.
        const startYear = parseInt(birthDate.substring(0, 4), 10);
        if (isNaN(startYear)) return null;

        const endYear = deathDate 
            ? parseInt(deathDate.substring(0, 4), 10)
            : new Date().getFullYear();
        
        const finalEndYear = isNaN(endYear) ? new Date().getFullYear() : endYear;
        const age = finalEndYear - startYear;
        return age < 0 ? 0 : age;
    }

    let age = end.getFullYear() - start.getFullYear();
    const m = end.getMonth() - start.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < start.getDate())) {
        age--;
    }
    return age < 0 ? 0 : age;
  };

  const genderColor = person.gender === 'male' ? 'text-blue-500 dark:text-blue-400' : 'text-pink-500 dark:text-pink-400';
  const hasContactInfo = person.contactInfo && Object.values(person.contactInfo).some(Boolean);
  const fullName = `${person.firstName} ${person.lastName}`.trim();
  const exSpouses = person.exSpouseIds?.map(id => people[id]).filter(Boolean) || [];
  const age = calculateAge(person.birthDate, person.deathDate);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-300 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-start justify-between mb-4">
          <div>
            <h2 id="details-modal-title" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">
              {fullName}
            </h2>
            <p className={`capitalize font-semibold ${genderColor}`}>{person.gender === 'male' ? 'მამრობითი' : 'მდედრობითი'}</p>
          </div>
           <div className="flex items-center gap-2">
            <button
              onClick={() => onGoogleSearch(person)}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
              title="ინფორმაციის მოძიება Google-ში"
              aria-label={`${fullName}-ს შესახებ ინფორმაციის მოძიება`}
            >
              <GlobeIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onEdit(person.id)}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
              aria-label={`${fullName}-ს რედაქტირება`}
            >
              <EditIcon className="h-5 w-5" />
            </button>
            {person.id !== 'root' && (
               <button
                  onClick={() => onDelete(person.id)}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-red-500 dark:hover:bg-red-600 hover:text-white transition-colors"
                  aria-label={`${fullName}-ს წაშლა`}
                >
                  <DeleteIcon className="h-5 w-5" />
                </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-black dark:hover:text-white transition-colors"
              aria-label="დეტალების ფანჯრის დახურვა"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <main className="space-y-4 text-gray-700 dark:text-gray-300">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {person.imageUrl ? (
              <img src={person.imageUrl} alt={fullName} className="w-32 h-32 object-cover rounded-full border-2 border-purple-400 dark:border-purple-500 flex-shrink-0" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="text-center sm:text-left">
              {person.birthDate && (
                <p>
                  <strong>დაიბადა:</strong> {formatDate(person.birthDate)}
                  {!person.deathDate && age !== null && <span className="text-gray-500 dark:text-gray-400 ml-2">({age} წლის)</span>}
                </p>
              )}
              {person.deathDate && (
                 <p>
                    <strong>გარდაიცვალა:</strong> {formatDate(person.deathDate)}
                    {age !== null && <span className="text-gray-500 dark:text-gray-400 ml-2">({age} წლის ასაკში)</span>}
                 </p>
              )}
              {!person.birthDate && !person.deathDate && (
                <p className="text-gray-500">თარიღები უცნობია</p>
              )}
            </div>
          </div>
          
          {person.bio && (
            <div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-1 mb-2">ბიოგრაფია</h3>
              <p className="whitespace-pre-wrap">{person.bio}</p>
            </div>
          )}
          
          {exSpouses.length > 0 && (
            <div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-1 mb-2">ყოფილი მეუღლეები</h3>
                <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700 dark:text-gray-300">
                    {exSpouses.map(ex => (
                        <li key={ex.id}>
                           <button 
                                onClick={() => onNavigate(ex.id)} 
                                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:underline focus:outline-none"
                            >
                                {ex.firstName} {ex.lastName}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
          )}

          {hasContactInfo && (
            <div>
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-1 mb-2">საკონტაქტო ინფორმაცია</h3>
              <ul className="space-y-2 mt-2">
                 {person.contactInfo?.phone && (
                   <li className="flex items-center gap-3">
                     <PhoneIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" /> 
                     <span>{person.contactInfo.phone}</span>
                   </li>
                 )}
                 {person.contactInfo?.email && (
                   <li className="flex items-center gap-3">
                     <EmailIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" /> 
                     <span>{person.contactInfo.email}</span>
                   </li>
                 )}
                 {person.contactInfo?.address && (
                    <li className="flex items-start gap-3">
                      <AddressIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-1" /> 
                      <button
                        onClick={() => onShowOnMap(person.contactInfo!.address!)}
                        className="text-left whitespace-pre-wrap text-purple-600 dark:text-purple-400 hover:underline focus:outline-none"
                        title="რუკაზე ჩვენება"
                      >
                        {person.contactInfo.address}
                      </button>
                    </li>
                 )}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DetailsModal;