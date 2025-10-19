import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { People, Person, Gender, ModalAction, ModalState, ModalContext, Relationship } from '../types';
import TreeNode from './TreeNode';
import AddPersonModal from './AddPersonModal';
import DetailsModal from './DetailsModal';
import ShareModal from './ShareModal';
import PasswordPromptModal from './PasswordPromptModal';
import StatisticsModal, { Statistics } from './StatisticsModal';
import BirthdayNotifier from './BirthdayNotifier';
import GoogleSearchPanel from './GoogleSearchPanel';
import ImportModal from './ImportModal';
import ExportModal from './ExportModal';
import { decryptData } from '../utils/crypto';

// Initial data for a new tree
const initialPeople: People = {
  'root': {
    id: 'root',
    firstName: 'დამფუძნებელი',
    lastName: '',
    gender: Gender.Male,
    children: [],
    parentIds: [],
    exSpouseIds: [],
    imageUrl: 'https://avatar.iran.liara.run/public/boy?username=Founder'
  }
};

const FamilyTreeApp: React.FC<{ user: any }> = ({ user }) => {
    const [people, setPeople] = useState<People>({});
    const [rootIdStack, setRootIdStack] = useState<string[]>(['root']);
    const [isLoading, setIsLoading] = useState(true);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, context: null });
    const [detailsModalPersonId, setDetailsModalPersonId] = useState<string | null>(null);
    const [highlightedPersonId, setHighlightedPersonId] = useState<string | null>(null);
    const [highlightedConnection, setHighlightedConnection] = useState<{ p1: string; p2: string; type: 'spouse' | 'parent-child' } | null>(null);
    const [hoveredPersonId, setHoveredPersonId] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'default' | 'compact'>('default');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Google Search Panel State
    const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<string | null>(null);
    const [searchSources, setSearchSources] = useState<any[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const ai = useRef<GoogleGenAI | null>(null);

    const viewRootId = rootIdStack[rootIdStack.length - 1];
    
    const updateTheme = useCallback((newTheme: 'light' | 'dark') => {
        setTheme(newTheme);
        localStorage.familyTreeTheme = newTheme;
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }, []);

    useEffect(() => {
        ai.current = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const storedTheme = localStorage.familyTreeTheme;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
             updateTheme('dark');
        } else {
             updateTheme('light');
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => updateTheme(e.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [updateTheme]);

    const fetchTreeData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/.netlify/functions/get-tree', {
                headers: { Authorization: `Bearer ${user.token.access_token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch tree data');
            const data = await response.json();
            if (data && data.people && Object.keys(data.people).length > 0) {
                setPeople(data.people);
                setRootIdStack(data.rootIdStack || ['root']);
            } else {
                setPeople(initialPeople);
                setRootIdStack(['root']);
            }
        } catch (error) {
            console.error(error);
            setPeople(initialPeople);
            setRootIdStack(['root']);
        } finally {
            setIsLoading(false);
            setDataLoaded(true);
        }
    }, [user]);

    const saveTreeData = useCallback(async (currentPeople: People, currentRootIdStack: string[]) => {
        if (!dataLoaded || isLoading) return;
        try {
            await fetch('/.netlify/functions/save-tree', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token.access_token}`,
                },
                body: JSON.stringify({ people: currentPeople, rootIdStack: currentRootIdStack }),
            });
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }, [user, dataLoaded, isLoading]);
    
    // Debounced save effect
    useEffect(() => {
        const handler = setTimeout(() => {
            saveTreeData(people, rootIdStack);
        }, 1500);
        return () => clearTimeout(handler);
    }, [people, rootIdStack, saveTreeData]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const data = params.get('data');
        if (data) {
            setIsPasswordPromptOpen(true);
        } else {
            fetchTreeData();
        }
    }, [fetchTreeData]);

    const handleNavigate = (personId: string) => {
        if (people[personId]) {
            setRootIdStack(prev => [...prev, personId]);
            setHighlightedPersonId(personId);
            setTimeout(() => setHighlightedPersonId(null), 1500);
        }
    };
    
    const handleCloseModal = () => setModalState({ isOpen: false, context: null });

    const handleModalSubmit = (
      formData: Partial<Person>,
      details: Partial<Person>,
      relationship?: Relationship,
      existingPersonId?: string,
    ) => {
      setPeople(currentPeople => {
          const newPeople = { ...currentPeople };

          // EDIT MODE
          if (modalState.context?.action === 'edit') {
              const personId = modalState.context.personId;
              const personToEdit = newPeople[personId];
              if (personToEdit) {
                  newPeople[personId] = {
                      ...personToEdit,
                      ...formData,
                      ...details,
                      contactInfo: { ...personToEdit.contactInfo, ...details.contactInfo }
                  };
              }
          }
          // ADD MODE
          else if (modalState.context?.action === 'add' && relationship) {
              const anchorPersonId = modalState.context.personId;
              const anchorPerson = newPeople[anchorPersonId];
              
              if(relationship === 'spouse' && existingPersonId) {
                  // Connect an existing ex-spouse
                  const exSpouse = newPeople[existingPersonId];
                  if(anchorPerson && exSpouse) {
                      // Move current spouse to ex-spouses if exists
                      if(anchorPerson.spouseId) {
                         anchorPerson.exSpouseIds = [...(anchorPerson.exSpouseIds || []), anchorPerson.spouseId];
                      }
                      anchorPerson.spouseId = exSpouse.id;
                      exSpouse.spouseId = anchorPerson.id;
                      anchorPerson.exSpouseIds = (anchorPerson.exSpouseIds || []).filter(id => id !== exSpouse.id);
                      exSpouse.exSpouseIds = (exSpouse.exSpouseIds || []).filter(id => id !== anchorPerson.id);
                  }
              } else {
                  // Add a new person
                  const newPersonId = Date.now().toString();
                  const newPerson: Person = {
                      id: newPersonId,
                      firstName: formData.firstName || '',
                      lastName: formData.lastName || '',
                      gender: formData.gender || Gender.Male,
                      spouseId: undefined,
                      children: [],
                      parentIds: [],
                      exSpouseIds: [],
                      ...details,
                  };
                  newPeople[newPersonId] = newPerson;

                  // Update relationships
                  switch (relationship) {
                      case 'child':
                          const anchorSpouseId = anchorPerson.spouseId;
                          anchorPerson.children = [...new Set([...anchorPerson.children, newPersonId])];
                          if (anchorSpouseId && newPeople[anchorSpouseId]) {
                              newPeople[anchorSpouseId].children = [...new Set([...newPeople[anchorSpouseId].children, newPersonId])];
                          }
                          newPerson.parentIds = anchorSpouseId ? [anchorPersonId, anchorSpouseId] : [anchorPersonId];
                          break;
                      case 'spouse':
                          if(anchorPerson.spouseId){
                              const oldSpouse = newPeople[anchorPerson.spouseId];
                              if(oldSpouse) oldSpouse.spouseId = undefined;
                              anchorPerson.exSpouseIds = [...(anchorPerson.exSpouseIds || []), anchorPerson.spouseId];
                          }
                          anchorPerson.spouseId = newPersonId;
                          newPerson.spouseId = anchorPersonId;
                          break;
                      case 'parent':
                          anchorPerson.parentIds = [...new Set([...anchorPerson.parentIds, newPersonId])];
                          newPerson.children = [...new Set([...newPerson.children, anchorPersonId])];
                          break;
                      case 'sibling':
                          if(anchorPerson.parentIds.length > 0){
                              anchorPerson.parentIds.forEach(parentId => {
                                  const parent = newPeople[parentId];
                                  if(parent) parent.children = [...new Set([...parent.children, newPersonId])];
                              });
                              newPerson.parentIds = [...anchorPerson.parentIds];
                          }
                          break;
                  }
              }
          }
          return newPeople;
      });
      handleCloseModal();
    };

    const handleDeletePerson = (personId: string) => {
        if (personId === 'root') {
            alert("დამფუძნებლის წაშლა შეუძლებელია.");
            return;
        }

        setPeople(currentPeople => {
            const newPeople = { ...currentPeople };
            const personToDelete = newPeople[personId];
            if (!personToDelete) return currentPeople;

            // Remove from parents' children list
            personToDelete.parentIds.forEach(parentId => {
                if (newPeople[parentId]) {
                    newPeople[parentId].children = newPeople[parentId].children.filter(id => id !== personId);
                }
            });

            // Remove from children's parents list
            personToDelete.children.forEach(childId => {
                if (newPeople[childId]) {
                    newPeople[childId].parentIds = newPeople[childId].parentIds.filter(id => id !== personId);
                }
            });
            
            // Remove from spouse and ex-spouses
            const allSpouses = [personToDelete.spouseId, ...(personToDelete.exSpouseIds || [])].filter(Boolean) as string[];
            allSpouses.forEach(spouseId => {
                if (newPeople[spouseId]) {
                    if (newPeople[spouseId].spouseId === personId) {
                        newPeople[spouseId].spouseId = undefined;
                    }
                    newPeople[spouseId].exSpouseIds = (newPeople[spouseId].exSpouseIds || []).filter(id => id !== personId);
                }
            });

            // Delete the person
            delete newPeople[personId];

            return newPeople;
        });

        // Update root stack if the deleted person was in it
        setRootIdStack(prevStack => prevStack.filter(id => id !== personId));
        setDetailsModalPersonId(null);
    };

    const handlePasswordSubmit = async (password: string) => {
        setIsPasswordLoading(true);
        setPasswordError(null);
        const params = new URLSearchParams(window.location.search);
        const data = params.get('data');

        try {
            if (!data) throw new Error("No data in URL");
            const decodedData = decodeURIComponent(data);
            const decryptedJson = await decryptData(decodedData, password);
            const parsedData = JSON.parse(decryptedJson);

            setPeople(parsedData.people);
            setRootIdStack(parsedData.rootIdStack);
            setIsPasswordPromptOpen(false);

            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
            console.error(error);
            setPasswordError("პაროლი არასწორია ან მონაცემები დაზიანებულია.");
        } finally {
            setIsPasswordLoading(false);
        }
    };
    
    const handleConnectionClick = (p1: string, p2: string, type: 'spouse' | 'parent-child') => {
        setHighlightedConnection({ p1, p2, type });
        setTimeout(() => setHighlightedConnection(null), 2000);
    };

    const performSearch = async (queryToSearch?: string) => {
        const currentQuery = queryToSearch || searchQuery;
        if (!currentQuery.trim() || !ai.current) return;
        
        setIsSearchLoading(true);
        setSearchError(null);
        setSearchResult(null);
        setSearchSources([]);

        try {
            const response = await ai.current.models.generateContent({
                model: "gemini-2.5-flash",
                contents: currentQuery,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });
            setSearchResult(response.text);
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setSearchSources(chunks);
        } catch (e) {
            console.error("Search failed", e);
            setSearchError("ძიება ვერ მოხერხდა. სცადეთ მოგვიანებით.");
        } finally {
            setIsSearchLoading(false);
        }
    };

    const handleGoogleSearch = async (person: Person) => {
        const query = `ვინ არის ${person.firstName} ${person.lastName}? დაბადების თარიღი: ${person.birthDate || 'უცნობია'}.`;
        setSearchQuery(query);
        setIsSearchPanelOpen(true);
        await performSearch(query);
    };

    const onShowOnMap = (address: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };
    
    const calculateStats = useCallback((): Statistics => {
      const allPeople = Object.values(people);
      if (allPeople.length === 0) {
        return { totalPeople: 0, genderData: { male: 0, female: 0 }, statusData: { living: 0, deceased: 0 }, ageGroupData: { '0-18': 0, '19-35': 0, '36-60': 0, '60+': 0 }, generationData: { labels: [], data: [] }, birthRateData: { labels: [], data: [] }, topMaleNames: [], topFemaleNames: [], oldestLivingPerson: null, averageLifespan: 0, mostCommonAddress: null };
      }
      
      const calculateAge = (birthDate?: string, deathDate?: string): number | null => {
        if (!birthDate) return null;
        const start = new Date(birthDate);
        const end = deathDate ? new Date(deathDate) : new Date();
        if (isNaN(start.getTime())) return null;
        let age = end.getFullYear() - start.getFullYear();
        const m = end.getMonth() - start.getMonth();
        if (m < 0 || (m === 0 && end.getDate() < start.getDate())) age--;
        return age;
      };

      let male = 0, female = 0, living = 0, deceased = 0;
      const ageGroups = { '0-18': 0, '19-35': 0, '36-60': 0, '60+': 0 };
      const livingPeople: (Person & { age: number})[] = [];
      const lifespans: number[] = [];
      const addressCounts: Record<string, number> = {};
      const maleNames: Record<string, number> = {};
      const femaleNames: Record<string, number> = {};
      
      allPeople.forEach(p => {
        if (p.gender === Gender.Male) {
          male++;
          if(p.firstName) maleNames[p.firstName] = (maleNames[p.firstName] || 0) + 1;
        } else {
          female++;
          if(p.firstName) femaleNames[p.firstName] = (femaleNames[p.firstName] || 0) + 1;
        }

        const age = calculateAge(p.birthDate, p.deathDate);
        if (p.deathDate) {
          deceased++;
          if(age !== null) lifespans.push(age);
        } else {
          living++;
          if (age !== null) {
            livingPeople.push({...p, age});
            if (age <= 18) ageGroups['0-18']++;
            else if (age <= 35) ageGroups['19-35']++;
            else if (age <= 60) ageGroups['36-60']++;
            else ageGroups['60+']++;
          }
        }
        if(p.contactInfo?.address) {
            addressCounts[p.contactInfo.address] = (addressCounts[p.contactInfo.address] || 0) + 1;
        }
      });
      
      const generations: Record<number, Person[]> = {};
      const traverse = (personId: string, level: number) => {
          if (!generations[level]) generations[level] = [];
          const person = people[personId];
          if(person && !generations[level].some(p => p.id === personId)) {
            generations[level].push(person);
            person.children.forEach(childId => traverse(childId, level + 1));
          }
      };
      if (people['root']) traverse('root', 0);
      
      const generationData = {
          labels: Object.keys(generations).map(k => `თაობა ${parseInt(k) + 1}`),
          data: Object.values(generations).map(g => g.length),
      };

      const birthRateData = {
        labels: generationData.labels.slice(0, -1),
        data: Object.entries(generations).slice(0, -1).map(([level, gen]) => {
            const childrenCount = generations[parseInt(level) + 1]?.length || 0;
            const parentCount = gen.length;
            return parentCount > 0 ? childrenCount / parentCount : 0;
        })
      };

      const oldestLivingPerson = livingPeople.length > 0 ? livingPeople.reduce((oldest, p) => p.age > oldest.age ? p : oldest) : null;
      const averageLifespan = lifespans.length > 0 ? Math.round(lifespans.reduce((a, b) => a + b, 0) / lifespans.length) : 0;
      const mostCommonAddressEntry = Object.entries(addressCounts).sort((a,b) => b[1] - a[1])[0];
      
      const sortAndTakeTop5 = (nameCounts: Record<string, number>) => Object.entries(nameCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      return {
        totalPeople: allPeople.length,
        genderData: { male, female },
        statusData: { living, deceased },
        ageGroupData: ageGroups,
        generationData,
        birthRateData,
        topMaleNames: sortAndTakeTop5(maleNames),
        topFemaleNames: sortAndTakeTop5(femaleNames),
        oldestLivingPerson: oldestLivingPerson ? { name: `${oldestLivingPerson.firstName} ${oldestLivingPerson.lastName}`, age: oldestLivingPerson.age } : null,
        averageLifespan,
        mostCommonAddress: mostCommonAddressEntry ? { address: mostCommonAddressEntry[0], count: mostCommonAddressEntry[1] } : null,
      };
    }, [people]);

    const peopleWithBirthdays = useMemo(() => {
        const currentMonth = new Date().getMonth();
        return Object.values(people).filter(p => {
            if (!p.birthDate || p.deathDate) return false;
            const birthMonth = new Date(p.birthDate).getMonth();
            return birthMonth === currentMonth;
        });
    }, [people]);

    const calculatedStats = useMemo(calculateStats, [people]);

    const handleExportJson = () => {
        const dataStr = JSON.stringify({ people, rootIdStack }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'family_tree_data.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleFileImport = (merge = false) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedData = JSON.parse(event.target?.result as string);
                        if(importedData.people && importedData.rootIdStack){
                            if(merge) {
                                // Simple merge: combine people, overwrite duplicates.
                                setPeople(current => ({...current, ...importedData.people}));
                            } else {
                                // Replace
                                if(window.confirm("დარწმუნებული ხართ, რომ გსურთ მიმდინარე ხის წაშლა და ახლის იმპორტი? ამ მოქმედების გაუქმება შეუძლებელია.")){
                                    setPeople(importedData.people);
                                    setRootIdStack(importedData.rootIdStack);
                                }
                            }
                        } else {
                            alert("ფაილის ფორმატი არასწორია.");
                        }
                    } catch (err) {
                        alert("ფაილის წაკითხვა ვერ მოხერხდა.");
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    if (isLoading) {
        return <div className="h-screen bg-white dark:bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div></div>;
    }

    const anchorPersonForModal = modalState.context ? people[modalState.context.personId] : null;
    const anchorSpouseForModal = anchorPersonForModal?.spouseId ? people[anchorPersonForModal.spouseId] : null;
    const anchorExSpousesForModal = anchorPersonForModal?.exSpouseIds?.map(id => people[id]).filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
            <header className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-4">
                     {rootIdStack.length > 1 && (
                        <button onClick={() => setRootIdStack(s => s.slice(0, -1))} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Back">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    )}
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">ჩემი გენეალოგია</h1>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={() => setViewMode(v => v === 'default' ? 'compact' : 'default')} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" title={viewMode === 'compact' ? 'გაფართოებული ხედი' : 'კომპაქტური ხედი'}>
                        {viewMode === 'compact' ? 
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg>
                        }
                    </button>
                    <button onClick={() => updateTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" title="თემის შეცვლა">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                     <button onClick={() => setIsImportModalOpen(true)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" title="იმპორტი">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                     </button>
                    <button onClick={() => setIsExportModalOpen(true)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" title="ექსპორტი">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    <button onClick={() => setIsShareModalOpen(true)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" title="გაზიარება">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                    </button>
                    <button onClick={() => setIsStatsModalOpen(true)} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" title="სტატისტიკა">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </button>
                    <button onClick={() => window.netlifyIdentity.logout()} className="px-3 py-1.5 text-sm rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors">გასვლა</button>
                </div>
            </header>

            <main className="p-4 md:p-8 overflow-x-auto">
                <div className="min-w-max">
                     <TreeNode
                        personId={viewRootId}
                        viewRootId={viewRootId}
                        people={people}
                        onAdd={(personId) => setModalState({ isOpen: true, context: { action: 'add', personId } })}
                        onEdit={(personId) => setModalState({ isOpen: true, context: { action: 'edit', personId } })}
                        onShowDetails={setDetailsModalPersonId}
                        onNavigate={handleNavigate}
                        highlightedPersonId={highlightedPersonId}
                        highlightedPeople={highlightedConnection ? new Set([highlightedConnection.p1, highlightedConnection.p2]) : null}
                        onConnectionClick={handleConnectionClick}
                        hoveredConnections={hoveredPersonId ? new Set(Object.values(people).filter(p => p.id === hoveredPersonId || p.spouseId === hoveredPersonId || p.children.includes(hoveredPersonId!) || p.parentIds.includes(hoveredPersonId!)).map(p => p.id)) : null}
                        onSetHover={setHoveredPersonId}
                        viewMode={viewMode}
                    />
                </div>
            </main>

            {modalState.isOpen && modalState.context && (
                <AddPersonModal 
                    isOpen={modalState.isOpen} 
                    onClose={handleCloseModal} 
                    onSubmit={handleModalSubmit} 
                    onDelete={handleDeletePerson} 
                    context={modalState.context} 
                    anchorPerson={anchorPersonForModal}
                    anchorSpouse={anchorSpouseForModal}
                    personToEdit={modalState.context.action === 'edit' ? anchorPersonForModal : undefined}
                    anchorPersonExSpouses={anchorExSpousesForModal}
                />
            )}
             {detailsModalPersonId && (
                <DetailsModal person={people[detailsModalPersonId]} people={people} onClose={() => setDetailsModalPersonId(null)} onEdit={(id) => { setDetailsModalPersonId(null); setModalState({ isOpen: true, context: { action: 'edit', personId: id } }); }} onDelete={handleDeletePerson} onNavigate={(id) => { setDetailsModalPersonId(null); handleNavigate(id); }} onGoogleSearch={handleGoogleSearch} onShowOnMap={onShowOnMap}/>
            )}
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} data={{ people, rootIdStack }} />
            <PasswordPromptModal isOpen={isPasswordPromptOpen} onClose={() => setIsPasswordPromptOpen(false)} onSubmit={handlePasswordSubmit} error={passwordError} isLoading={isPasswordLoading} />
            <StatisticsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} stats={calculatedStats} theme={theme} />
            <BirthdayNotifier peopleWithBirthdays={peopleWithBirthdays} onNavigate={handleNavigate} />
            <GoogleSearchPanel isOpen={isSearchPanelOpen} onClose={() => setIsSearchPanelOpen(false)} onSearch={() => performSearch()} query={searchQuery} setQuery={setSearchQuery} result={searchResult} sources={searchSources} isLoading={isSearchLoading} error={searchError} />
            <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImportFromFile={() => handleFileImport(false)} onMergeFromFile={() => handleFileImport(true)} />
            <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onExportJson={handleExportJson} />
        </div>
    );
};

export default FamilyTreeApp;