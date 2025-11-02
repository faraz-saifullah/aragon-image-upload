export function PhotoRestrictions() {
  const restrictions = [
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
            strokeWidth="1.333"
            d="M10 17.5c-3.452 0-6.25-2.67-6.25-5.964 0-2.26 2.944-6.134 4.791-8.342A1.895 1.895 0 0 1 10 2.5m0 15V15m0 2.5c2.098 0 3.955-.986 5.088-2.5M10 2.5c.536 0 1.071.231 1.459.694.437.523.936 1.14 1.443 1.806M10 2.5V5m0 5h5.925M10 10v2.5m0-2.5V7.5m5.925 2.5c.206.56.325 1.08.325 1.536 0 .328-.028.65-.081.964m-.245-2.5c-.287-.782-.744-1.64-1.28-2.5M10 12.5h6.169M10 12.5V15m6.169-2.5a5.789 5.789 0 0 1-1.08 2.5M10 7.5h4.644M10 7.5V5m4.644 2.5A33.155 33.155 0 0 0 12.902 5M10 5h2.902"
          ></path>
        </svg>
      ),
      title: 'No Low-Res / AI Photos',
      description: "Don't upload photos that are, blurry, too dark / bright, or AI-generated",
      image: '/aragon_assets/low_quality.png',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 22"
          fill="none"
          height="20"
          className="shrink-0"
        >
          <g fill="#000">
            <path
              fillRule="evenodd"
              d="M14.919 1.355v2.589c.572.42 2.471 1.963 2.425 3.957-.021.857-.445 1.597-1.195 2.08-.622.402-1.422.608-2.243.608a4.903 4.903 0 0 1-1.881-.373c-.754-.317-1.206-.921-1.298-1.7H8.864c-.093.775-.544 1.383-1.298 1.7a4.903 4.903 0 0 1-1.88.373c-.822 0-1.622-.206-2.244-.608-.75-.483-1.174-1.223-1.195-2.08C2.2 5.907 4.099 4.363 4.672 3.944V1.355c0-.195.16-.355.355-.355.196 0 .356.16.356.355v2.486c1.774.466 3.257 2.393 3.474 3.96h1.877c.217-1.57 1.7-3.494 3.474-3.96V1.355c0-.195.16-.355.355-.355.196 0 .356.16.356.355ZM3.826 9.38c.903.583 2.325.658 3.463.178.672-.28.963-.825.87-1.614C8 6.596 6.65 4.847 5.11 4.502c-.466.345-2.19 1.725-2.151 3.378.018.79.484 1.251.868 1.5Zm8.476.178c1.138.48 2.56.405 3.463-.178.384-.249.85-.71.868-1.497.039-1.656-1.686-3.036-2.151-3.377-1.54.341-2.891 2.094-3.051 3.441-.092.786.199 1.33.871 1.611Zm-7.8 4.52h10.59a.35.35 0 0 1 .32.209c.369.793.365 1.56-.008 2.286a.34.34 0 0 1-.203.174c-.035.011-3.694 1.256-3.694 3.549a.36.36 0 0 1-.124.27c-.05.046-.537.434-1.586.434s-1.536-.388-1.59-.437a.36.36 0 0 1-.124-.27c0-2.294-3.658-3.538-3.694-3.55a.362.362 0 0 1-.203-.173c-.373-.722-.377-1.494-.007-2.287a.361.361 0 0 1 .324-.206Zm6.305 6.015c.167-2.41 3.296-3.701 4.028-3.971.181-.427.189-.864.021-1.334H4.742c-.17.47-.164.907.021 1.334.73.27 3.862 1.56 4.029 3.971.16.078.487.196 1.006.196.52 0 .846-.118 1.01-.196Z"
              clipRule="evenodd"
            ></path>
          </g>
        </svg>
      ),
      title: 'No Revealing Clothes',
      description: "Don't upload photos with low necklines, or in skimpy outfits",
      image: '/aragon_assets/revealing.png',
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
            stroke="#1D1D1E"
            d="M18.966 9.725a.272.272 0 0 1-.009.278c-.012.02-.927 1.41-2.584 1.503l2.337 1.305a.27.27 0 0 1 .11.359c-.897 1.773-2.304 2.665-4.189 2.665-.42 0-.86-.045-1.323-.133a7.44 7.44 0 0 1-1.576-.503c-.55-.236-1.11-.451-1.686-.643C8.634 15.514 7.263 16 5.952 16a5.13 5.13 0 0 1-1.104-.118c-2.468-.533-3.758-2.674-3.812-2.765a.233.233 0 0 1-.03-.071v-.015C1 13.007 1 12.987 1 12.963c0-.009.003-.014.003-.023a.182.182 0 0 1 .015-.06c0-.008.003-.014.006-.02 0-.003.003-.006.003-.01a.241.241 0 0 1 .041-.058c.003-.003.01-.006.012-.01.018-.014.036-.028.056-.04.004 0 .007-.004.01-.007l4.247-2.17v-1.95C5.393 6.071 7.483 4 10.053 4c2.568 0 4.659 2.07 4.659 4.615v1.593c.668-.483 1.646-1.266 1.828-1.75a.277.277 0 0 1 .27-.176.274.274 0 0 1 .254.203l.291 1.1h1.37c.102 0 .194.055.241.14Z"
          ></path>
        </svg>
      ),
      title: 'No Accessories',
      description: 'Avoid photos of you with hats, sunglasses, headphones, lanyards, etc.',
      image: '/aragon_assets/no_accessories.jpg',
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
            strokeWidth="1.6"
            d="M9 17.434c0-3.434 2.41-4.373 4.12-4.48.807-.05 1.575-.05 2.38 0 .447.027.868.136 1.254.311m0 0a7.5 7.5 0 1 0-13.508-6.53 7.5 7.5 0 0 0 13.508 6.53ZM17 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
          ></path>
        </svg>
      ),
      title: 'No Unnatural Angles',
      description: "Avoid photos taken from the side, or where you're looking away",
      image: '/aragon_assets/taken_from_angle.webp',
    },
  ];

  return (
    <div
      className="rounded-2xl px-6 border border-solid py-1"
      style={{ background: '#FFF2F0', borderColor: '#FFD4CC' }}
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
              <path
                stroke="#FF4E64"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M22.577 9.469 9.423 22.622M25.5 16a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0Z"
              ></path>
            </svg>
            <p className="text-lg font-bold text-black">Photo Restrictions</p>
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
          {restrictions.map((restriction, index) => (
            <div key={index} className="flex h-max w-full flex-col gap-3 rounded-2xl">
              <div className="size-full relative flex aspect-[2048/2260] grow overflow-hidden rounded-lg shadow-lg">
                <div className="w-full h-full bg-slate-200 rounded-lg"></div>
              </div>
              <span className="text-left text-sm font-medium text-black">
                <div>
                  <div className="flex items-center gap-1 font-semibold">
                    {restriction.icon}
                    {restriction.title}
                  </div>
                  <p className="mt-1">{restriction.description}</p>
                </div>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
