import React from 'react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFromFile: () => void;
  onMergeFromFile: () => void;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const JsonImportIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);
const DocumentPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportFromFile, onMergeFromFile }) => {
    const handleImportClick = () => {
        onImportFromFile();
        onClose();
    };

    const handleMergeClick = () => {
        onMergeFromFile();
        onClose();
    };

    if (!isOpen) return null;

    const buttonBaseClasses = "w-full p-4 rounded-lg border flex items-center gap-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800";
    const buttonHoverClasses = "hover:bg-gray-100 dark:hover:bg-gray-700";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-300 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <header className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">მონაცემების იმპორტი</h2>
                    <button onClick={onClose} className="p-2 -mt-2 -mr-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="დახურვა">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <p className="text-gray-600 dark:text-gray-400 mb-6">აირჩიეთ, როგორ გსურთ მონაცემების იმპორტირება. ფაილიდან იმპორტი მოგთხოვთ დადასტურებას.</p>

                <div className="space-y-4">
                     <a
                        href="https://forms.gle/FEpBTcWyN8t7V9iC8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${buttonBaseClasses} bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 ${buttonHoverClasses}`}
                    >
                        <DocumentTextIcon className="w-8 h-8 text-purple-500 flex-shrink-0" />
                        <div className="flex-grow">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">მონაცემების დამატება ფორმით</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">ხსნის Google Forms-ს, სადაც შეგიძლიათ შეავსოთ და გამოაგზავნოთ მონაცემები.</p>
                        </div>
                    </a>

                    <button
                        onClick={handleImportClick}
                        className={`${buttonBaseClasses} bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 ${buttonHoverClasses}`}
                    >
                        <JsonImportIcon className="w-8 h-8 text-purple-500 flex-shrink-0" />
                        <div className="flex-grow">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">იმპორტი ფაილიდან (ჩანაცვლება)</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">წაშლის მიმდინარე ხეს და ჩაანაცვლებს ფაილის მონაცემებით.</p>
                        </div>
                    </button>

                    <button
                        onClick={handleMergeClick}
                        className={`${buttonBaseClasses} bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 ${buttonHoverClasses}`}
                    >
                        <DocumentPlusIcon className="w-8 h-8 text-purple-500 flex-shrink-0" />
                        <div className="flex-grow">
                            <span className="font-semibold text-gray-800 dark:text-gray-200">მონაცემების შერწყმა ფაილიდან</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">შეურწყამს ფაილის მონაცემებს მიმდინარე ხესთან.</p>
                        </div>
                    </button>
                </div>
                <footer className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                    <a href="https://cutt.ly/geni_instruqcia" target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                        იმპორტის დეტალური ინსტრუქცია
                    </a>
                </footer>
            </div>
        </div>
    );
};

export default ImportModal;