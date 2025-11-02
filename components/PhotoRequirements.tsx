export function PhotoRequirements() {
  const requirements = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          className="shrink-0"
        >
          <g stroke="#282930">
            <path
              strokeWidth="1.6"
              d="M13.34 2.5H6.673c-1.15 0-2.083.933-2.083 2.083v10.834c0 1.15.933 2.083 2.083 2.083h6.667c1.15 0 2.083-.933 2.083-2.083V4.583c0-1.15-.933-2.083-2.083-2.083Z"
            ></path>
            <path
              strokeWidth="1.25"
              d="M7.506 2.594c-.389.026-.798.059-1.234.097-.978.085-1.616.862-1.706 1.85-.371 4.044-.3 6.879.024 10.877.081 1.006.726 1.809 1.722 1.895 2.86.255 4.526.244 7.403-.002.993-.085 1.626-.89 1.709-1.893.33-4.039.363-6.867.012-10.872-.087-.992-.715-1.771-1.697-1.857a65.554 65.554 0 0 0-1.202-.095m-5.031 0 .204.95a1.25 1.25 0 0 0 1.222.987h2.163a1.25 1.25 0 0 0 1.217-.968l.225-.97m-5.031 0a33.781 33.781 0 0 1 5.031 0"
            ></path>
            <path
              strokeWidth="1.6"
              d="M5.178 16.791c.684-1.093 1.817-1.857 3.16-1.955h3.336c1.341.097 2.474.861 3.158 1.954m-2.333-6.29a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
            ></path>
          </g>
        </svg>
      ),
      title: 'Selfies',
      description: 'Upload frontal selfies that are well-lit and taken at eye-level',
      image: '/aragon_assets/selfie.jpg',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          className="shrink-0"
        >
          <g stroke="#282930">
            <path
              strokeWidth="1.6"
              d="M5.417 17.5A2.917 2.917 0 0 1 2.5 14.583v-10c0-1.15.933-2.083 2.083-2.083H6.25c1.15 0 2.083.933 2.083 2.083v4.085M5.417 17.5a2.917 2.917 0 0 0 2.916-2.917v-2.916M5.417 17.5h10c1.15 0 2.083-.933 2.083-2.083V13.75c0-1.15-.933-2.083-2.083-2.083h-1.41M3.103 16.359a2.917 2.917 0 0 0 4.09.538m1.14-8.23 3.24-2.486c.913-.7 2.221-.529 2.922.384l1.014 1.322c.701.913.53 2.22-.384 2.921l-1.118.859m-5.674-3v3m5.674 0H8.333"
            ></path>
            <path strokeLinecap="round" strokeWidth="2.083" d="M5.416 14.167h-.008"></path>
          </g>
        </svg>
      ),
      title: 'Variety',
      description: 'Upload photos in different outfits and backgrounds.',
      image: '/aragon_assets/variety.png',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          className="shrink-0"
        >
          <g stroke="#282930">
            <path
              strokeWidth="1.6"
              d="M3.556 5.819c.08-.87.774-1.554 1.644-1.63 3.573-.307 6.054-.308 9.6-.001a1.809 1.809 0 0 1 1.645 1.641c.312 3.527.283 6.018-.01 9.574a1.818 1.818 0 0 1-1.657 1.663c-3.555.301-6.033.3-9.543.001a1.822 1.822 0 0 1-1.658-1.669c-.287-3.52-.351-6.017-.021-9.579Z"
            ></path>
            <path
              strokeLinecap="round"
              strokeWidth="1.25"
              d="M6.666 2.708v2.917M13.334 2.708v2.917M3.75 8.125h12.5"
            ></path>
            <path
              strokeLinecap="round"
              strokeWidth="1.667"
              d="M6.666 11.042h.008M6.666 13.958h.008M10.008 11.042h.008M10.008 13.958h.008M13.35 11.042h.008M13.35 13.958h.008"
            ></path>
          </g>
        </svg>
      ),
      title: 'Recency & Consistency',
      description:
        'Upload recent photos (last 6 months). Choose ones where your hairstyle is consistent and your hair is tidy.',
      image: '/aragon_assets/recency.jpg',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="none"
          className="shrink-0"
        >
          <path
            stroke="#282930"
            strokeLinecap="round"
            strokeWidth="1.6"
            d="M10 2.5v1.875M15 5l-.934.934M15 15l-.934-.934M5 15l.934-.934M5 5l.934.934M10 15.625V17.5M4.375 10H2.5m15 0h-1.875m-2.292 0a3.333 3.333 0 1 1-6.666 0 3.333 3.333 0 0 1 6.666 0Z"
          ></path>
        </svg>
      ),
      title: 'Clear',
      description:
        'Upload photos taken from a good distance, ideally taken from the chest or waist up.',
      image: '/aragon_assets/clarity.jpg',
    },
  ];

  return (
    <div
      className="rounded-2xl px-6 border border-solid py-1"
      style={{ background: '#E8F5F0', borderColor: '#B8E6D5' }}
    >
      <div className="border-b">
        <button className="flex flex-1 items-center justify-between py-4 w-full text-left hover:no-underline text-white">
          <div className="flex items-center gap-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 32 32"
              fill="none"
              height="32"
              width="32"
            >
              <g stroke="#01AC5E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <path d="M25.5 16a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0Z"></path>
                <path d="m12 16 3 3.5 5.222-6.666"></path>
              </g>
            </svg>
            <p className="text-lg font-bold text-black">Photo Requirements</p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 shrink-0 stroke-black"
          >
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
      </div>

      <div className="pb-8 pt-6">
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
          {requirements.map((req, index) => (
            <div key={index} className="flex h-max w-full flex-col gap-3 rounded-2xl">
              <div className="size-full relative flex aspect-[2048/2260] grow overflow-hidden rounded-lg shadow-lg">
                <div className="w-full h-full bg-slate-200 rounded-lg"></div>
              </div>
              <span className="text-left text-sm font-medium text-black">
                <div>
                  <div className="flex items-center gap-1 font-semibold">
                    {req.icon}
                    {req.title}
                  </div>
                  <p className="mt-1">{req.description}</p>
                </div>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
