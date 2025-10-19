import React, { useState, useEffect } from 'react';
import { Gender, ModalContext, Person, Relationship } from '../types';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: Partial<{ firstName: string; lastName:string; gender: Gender; }>,
    details: Partial<{ 
      birthDate: string; 
      deathDate: string; 
      imageUrl: string; 
      contactInfo: { phone: string; email: string; address: string; }; 
      bio: string;
    }>,
    relationship?: Relationship,
    existingPersonId?: string,
  ) => void;
  onDelete: (personId: string) => void;
  context: ModalContext | null;
  anchorPerson?: Person | null;
  anchorSpouse?: Person | null;
  personToEdit?: Person | null;
  anchorPersonExSpouses?: Person[];
}

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

// Converts storage format (YYYY-MM-DD or YYYY) to display format (DD.MM.YYYY or YYYY)
const convertStorageToDisplay = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) { // YYYY-MM-DD
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  }
  return dateStr; // Assume YYYY
};

// Converts display format (DD.MM.YYYY or YYYY) to storage format (YYYY-MM-DD or YYYY)
const convertDisplayToStorage = (dateStr: string): string => {
    if (!dateStr) return '';
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) { // DD.MM.YYYY
        const [d, m, y] = dateStr.split('.');
        return `${y}-${m}-${d}`;
    }
    if (/^\d{4}$/.test(dateStr)) { // YYYY
        return dateStr;
    }
    return ''; // Return empty for invalid format to avoid data corruption
};


const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose, onSubmit, onDelete, context, anchorPerson, anchorSpouse, personToEdit, anchorPersonExSpouses }) => {
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.Male);
  const [birthDate, setBirthDate] = useState(''); // Stores display format
  const [deathDate, setDeathDate] = useState(''); // Stores display format
  const [imageUrl, setImageUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  
  // Modal state
  const [relationship, setRelationship] = useState<Relationship>('child');
  const [title, setTitle] = useState('');
  const [submitText, setSubmitText] = useState('');
  const [spouseMode, setSpouseMode] = useState<'new' | 'existing'>('new');
  const [selectedExSpouseId, setSelectedExSpouseId] = useState('');

  const isEditMode = context?.action === 'edit';

  // Effect to initialize or reset the form when the modal opens or its context changes.
  useEffect(() => {
    if (!isOpen) return;

    const resetFields = () => {
      setFirstName('');
      setLastName('');
      setGender(Gender.Male);
      setBirthDate('');
      setDeathDate('');
      setImageUrl('');
      setPhone('');
      setEmail('');
      setAddress('');
      setBio('');
      setRelationship('child');
      setSpouseMode('new');
      setSelectedExSpouseId('');
    };

    if (isEditMode && personToEdit) {
      setTitle('პიროვნების რედაქტირება');
      setSubmitText('ცვლილებების შენახვა');
      setFirstName(personToEdit.firstName);
      setLastName(personToEdit.lastName);
      setGender(personToEdit.gender);
      setBirthDate(convertStorageToDisplay(personToEdit.birthDate));
      setDeathDate(convertStorageToDisplay(personToEdit.deathDate));
      setImageUrl(personToEdit.imageUrl || '');
      setPhone(personToEdit.contactInfo?.phone || '');
      setEmail(personToEdit.contactInfo?.email || '');
      setAddress(personToEdit.contactInfo?.address || '');
      setBio(personToEdit.bio || '');
    } else if (context?.action === 'add') {
      setTitle('ნათესავის დამატება');
      setSubmitText('დამატება');
      resetFields();
    }
  }, [isOpen, context, personToEdit, isEditMode]);

  // Effect to dynamically update the UI (title, gender, last name) based on the selected relationship.
  useEffect(() => {
    if (isOpen && context?.action === 'add' && anchorPerson) {
      const relationshipTranslations: Record<Relationship, string> = {
        child: 'შვილის',
        spouse: 'მეუღლის',
        parent: 'მშობლის',
        sibling: 'დის/ძმის'
      };
      const relText = relationshipTranslations[relationship] || '';
      const anchorFullName = `${anchorPerson.firstName} ${anchorPerson.lastName}`.trim();
      setTitle(`${relText} დამატება ${anchorFullName}-თვის`);

      if (relationship === 'spouse') {
          setGender(anchorPerson.gender === Gender.Male ? Gender.Female : Gender.Male);
          // Reset spouse mode when relationship changes
          setSpouseMode('new');
          setSelectedExSpouseId('');
      }

      if (relationship === 'child') {
        const father = anchorPerson.gender === Gender.Male 
          ? anchorPerson 
          : anchorSpouse;
        
        if (father && father.lastName) {
          setLastName(father.lastName);
        } else {
          setLastName(''); 
        }
      } else {
         if(!isEditMode) {
           setLastName('');
        }
      }
    }
  }, [isOpen, context, anchorPerson, anchorSpouse, relationship, isEditMode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          alert("სურათის ზომა არ უნდა აღემატებოდეს 2MB-ს.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
    const handleDateBlur = (e: React.FocusEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
        let value = e.target.value.trim();
        if (!value) {
            setter('');
            return;
        }

        // Normalize separators and remove any non-digit/non-dot characters
        let cleanedValue = value.replace(/[-/\\_]/g, '.').replace(/[^0-9.]/g, '');

        const parts = cleanedValue.split('.').filter(Boolean);

        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            if (year.length === 4) {
                 setter(`${day}.${month}.${year}`);
            } else {
                setter(cleanedValue); // Keep as is if year is not 4 digits
            }
        } else if (parts.length === 1 && parts[0].length === 8) {
            // Handle case where user types DDMMYYYY
            const day = parts[0].slice(0, 2);
            const month = parts[0].slice(2, 4);
            const year = parts[0].slice(4, 8);
            setter(`${day}.${month}.${year}`);
        } else if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
            // It's a valid year
            setter(parts[0]);
        } else {
            // For other invalid or incomplete formats, just keep the cleaned value
            setter(cleanedValue);
        }
    };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const detailsToSubmit = {
        birthDate: convertDisplayToStorage(birthDate),
        deathDate: convertDisplayToStorage(deathDate),
        imageUrl,
        contactInfo: { phone, email, address },
        bio,
    };

    if (isEditMode) {
        if (firstName.trim() || lastName.trim()) {
            onSubmit({ firstName, lastName, gender }, detailsToSubmit);
        }
    } else { // Add mode
        if (relationship === 'spouse' && spouseMode === 'existing') {
            if (selectedExSpouseId) {
                onSubmit({}, {}, relationship, selectedExSpouseId);
            }
        } else {
             if (firstName.trim() || lastName.trim()) {
                onSubmit({ firstName, lastName, gender }, detailsToSubmit, relationship);
            }
        }
    }
  };
  
  const handleDelete = () => {
    if(isEditMode && personToEdit){
      onDelete(personToEdit.id);
    }
  }

  if (!isOpen || !context) return null;

  const showGenderSelector = isEditMode || relationship !== 'spouse';
  const showFullForm = !(!isEditMode && relationship === 'spouse' && spouseMode === 'existing');

  const inputStyles = "w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white";
  const selectStyles = `${inputStyles} appearance-none`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-300 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {!isEditMode && anchorPerson && (
             <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">ურთიერთობა</label>
                <select id="relationship" value={relationship} onChange={e => setRelationship(e.target.value as Relationship)} className={selectStyles}>
                    <option value="child">შვილი</option>
                    <option value="spouse">მეუღლე</option>
                    <option value="parent" disabled={anchorPerson.parentIds.length >= 2}>მშობელი</option>
                    <option value="sibling" disabled={anchorPerson.parentIds.length === 0}>და/ძმა</option>
                </select>
                {relationship === 'sibling' && anchorPerson.parentIds.length === 0 && <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">არ შეგიძლიათ დაამატოთ და/ძმა პიროვნებას, რომელსაც ხეში მშობლები განსაზღვრული არ აქვს.</p>}
                {relationship === 'parent' && anchorPerson.parentIds.length >= 2 && <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">ამ პიროვნებას უკვე ჰყავს ორი მშობელი.</p>}
             </div>
          )}
          
          {!isEditMode && relationship === 'spouse' && anchorPersonExSpouses && anchorPersonExSpouses.length > 0 && (
             <div className="p-3 rounded-md border border-gray-300 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">მეუღლის დამატების მეთოდი</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="spouseMode" value="new" checked={spouseMode === 'new'} onChange={() => setSpouseMode('new')} className="form-radio text-purple-500 bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600 focus:ring-purple-500" />
                    <span>ახალი პიროვნება</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="spouseMode" value="existing" checked={spouseMode === 'existing'} onChange={() => setSpouseMode('existing')} className="form-radio text-purple-500 bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600 focus:ring-purple-500" />
                    <span>არსებულის არჩევა</span>
                  </label>
                </div>
                 {spouseMode === 'existing' && (
                    <div className="mt-3">
                        <label htmlFor="exSpouseSelect" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">აირჩიეთ ყოფილი მეუღლე</label>
                        <select id="exSpouseSelect" value={selectedExSpouseId} onChange={e => setSelectedExSpouseId(e.target.value)} className={selectStyles} required>
                            <option value="" disabled>აირჩიეთ...</option>
                            {anchorPersonExSpouses.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                        </select>
                    </div>
                )}
             </div>
          )}

        {showFullForm && (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">სახელი</label>
                    <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputStyles} placeholder="შეიყვანეთ სახელი" required autoFocus />
                    </div>
                    <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">გვარი</label>
                    <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputStyles} placeholder="შეიყვანეთ გვარი" />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">პროფილის სურათი</label>
                    <div className="mt-2 flex items-center gap-4">
                        {imageUrl ? (
                        <img src={imageUrl} alt="პროფილი" className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600" />
                        ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                            <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500"/>
                        </div>
                        )}
                        <input
                        type="file"
                        id="imageUpload"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleImageUpload}
                        className="hidden"
                        />
                        <label htmlFor="imageUpload" className="cursor-pointer px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm font-medium text-gray-800 dark:text-gray-100">
                        სურათის არჩევა
                        </label>
                        {imageUrl && (
                        <button type="button" onClick={() => setImageUrl('')} className="text-xs text-red-500 dark:text-red-400 hover:underline">
                            წაშლა
                        </button>
                        )}
                    </div>
                    </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">დაბადების თარიღი</label>
                        <input type="text" id="birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} onBlur={(e) => handleDateBlur(e, setBirthDate)} className={inputStyles} placeholder="DD.MM.YYYY ან YYYY"/>
                    </div>
                    <div>
                        <label htmlFor="deathDate" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">გარდაცვალების თარიღი</label>
                        <input type="text" id="deathDate" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} onBlur={(e) => handleDateBlur(e, setDeathDate)} className={inputStyles} placeholder="DD.MM.YYYY ან YYYY"/>
                    </div>
                </div>
                
                <div className="space-y-4 rounded-md border border-gray-300 dark:border-gray-700 p-3">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">საკონტაქტო ინფორმაცია</h3>
                    <div>
                        <label htmlFor="phone" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ტელეფონი</label>
                        <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ტელეფონის ნომერი" className={inputStyles}/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ელ. ფოსტა</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ელექტრონული ფოსტა" className={inputStyles}/>
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">მისამართი</label>
                        <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="საცხოვრებელი მისამართი" className={inputStyles}/>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">ბიოგრაფია</label>
                    <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="მოკლე ბიოგრაფია..." className={inputStyles}></textarea>
                </div>

                {showGenderSelector && (
                    <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">სქესი</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value={Gender.Male} checked={gender === Gender.Male} onChange={() => setGender(Gender.Male)} className="form-radio text-blue-500 bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600 focus:ring-blue-500" />
                        <span className="text-blue-600 dark:text-blue-400">მამრობითი</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value={Gender.Female} checked={gender === Gender.Female} onChange={() => setGender(Gender.Female)} className="form-radio text-pink-500 bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600 focus:ring-pink-500" />
                        <span className="text-pink-600 dark:text-pink-400">მდედრობითი</span>
                        </label>
                    </div>
                    </div>
                )}
            </div>
        )}

          <div className="flex justify-between items-center pt-2">
            <div>
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                  წაშლა
                </button>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100 transition-colors">გაუქმება</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors">{submitText}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPersonModal;