import React from 'react';

declare global {
  interface Window {
    netlifyIdentity: any;
  }
}

const TreeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V19.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V5.25A.75.75 0 0112 4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 10.5a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 14.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H8.25a.75.75 0 01-.75-.75v-.008z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);

const CloudIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-2.43-2.43A3.75 3.75 0 0013.5 4.5c-2.122 0-3.873 1.54-4.372 3.592A4.5 4.5 0 002.25 15z" />
    </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
);


const LandingPage: React.FC = () => {

  const handleLogin = () => {
    if (window.netlifyIdentity) {
      window.netlifyIdentity.open();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center min-h-screen p-6">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600 pb-2">
            გენეალოგიური ხე
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300">
            აღმოაჩინეთ, შექმენით და ვიზუალურად გამოსახეთ თქვენი ოჯახის ისტორია. დაიწყეთ თქვენი საგვარეულო ხის აწყობა დღესვე.
          </p>
          <button
            onClick={handleLogin}
            className="mt-10 px-8 py-4 text-lg font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-transform transform hover:scale-105"
          >
            შესვლა / რეგისტრაცია
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-12">
            ძირითადი შესაძლებლობები
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/50 mx-auto mb-4">
                <TreeIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">ინტერაქტიული ხე</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                მარტივად დაამატეთ ოჯახის წევრები, განსაზღვრეთ ურთიერთობები და იხილეთ, როგორ იზრდება თქვენი საგვარეულო ხე.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/50 mx-auto mb-4">
                <CloudIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">ღრუბლოვანი სინქრონიზაცია</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                თქვენი მონაცემები ავტომატურად ინახება და ხელმისაწვდომია ნებისმიერი მოწყობილობიდან, ნებისმიერ დროს.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/50 mx-auto mb-4">
                <LockIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">უსაფრთხო და პრივატული</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                თქვენი ოჯახის ისტორია დაცულია. მონაცემები ეკუთვნის მხოლოდ თქვენ და იმართება თქვენ მიერ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} გენეალოგიური ხე. ყველა უფლება დაცულია.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
