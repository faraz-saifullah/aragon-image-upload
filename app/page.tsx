'use client';

import { useState, useCallback, useEffect } from 'react';
import { UploadSection } from '@/components/UploadSection';
import { UploadedImagesPanel } from '@/components/UploadedImagesPanel';
import { UserSwitcher } from '@/components/UserSwitcher';
import { ImageMetadata } from '@/lib/types/image';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export default function Home() {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load first user on mount
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((users) => {
        if (users.length > 0) {
          setCurrentUser(users[0]);
        }
      })
      .catch((err) => console.error('Failed to load users:', err));
  }, []);

  const handleUploadComplete = useCallback((newImage: ImageMetadata) => {
    setImages((prev) => [newImage, ...prev]);
  }, []);

  const handleStatusUpdate = useCallback((updatedImage: ImageMetadata) => {
    setImages((prev) => prev.map((img) => (img.id === updatedImage.id ? updatedImage : img)));
  }, []);

  const handleRemoveImage = useCallback((imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  return (
    <div
      className="size-full relative h-screen w-screen overflow-hidden"
      style={{ background: 'white' }}
    >
      {/* Header */}
      <div className="sticky h-14 w-full border-b border-solid border-slate-200 shadow-sm z-50">
        <header className="max-w-[1400px] mx-auto flex h-full items-center justify-between px-8">
          {/* Logo */}
          <div className="flex flex-row items-center justify-center hover:cursor-pointer">
            <div className="relative mb-[2px] h-7 w-7">
              <svg
                width="33"
                height="32"
                viewBox="0 0 33 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.300049"
                  width="32"
                  height="32"
                  rx="7.68"
                  fill="url(#paint0_linear_3791_32364)"
                ></rect>
                <g clipPath="url(#clip0_3791_32364)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16.5528 24.7301C16.618 24.9563 16.2951 25.1331 16.1395 24.9483C9.41872 16.9595 18.1263 12.7917 17.8284 6.28018C17.8174 6.03954 18.2421 5.91452 18.3638 6.12767C25.9483 19.4098 14.3959 17.2575 16.5528 24.7301Z"
                    fill="white"
                  ></path>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M18.9485 25.8852C18.8272 25.9367 18.6797 25.8744 18.6387 25.7572C16.4582 19.5303 22.8965 19.5745 23.0972 13.9906C23.1061 13.7424 23.5659 13.6462 23.6547 13.8806C26.1111 20.364 24.4849 23.5355 18.9485 25.8852Z"
                    fill="white"
                  ></path>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.2323 25.9802C14.4414 26.0428 14.5964 25.8107 14.4629 25.6497C7.60474 17.3833 15.1511 14.7553 13.2065 10.142C13.119 9.93453 12.7821 10.0098 12.7617 10.2316C12.6107 11.8768 11.7861 13.7327 11.1824 14.9487C9.96121 17.319 9.6149 16.1395 9.78631 14.7353C9.81438 14.5054 9.46606 14.362 9.33443 14.559C6.36675 19.0008 8.36945 24.2217 14.2323 25.9802Z"
                    fill="white"
                  ></path>
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear_3791_32364"
                    x1="7.10005"
                    y1="35.6"
                    x2="37.9"
                    y2="-20.4"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#EB6002"></stop>
                    <stop offset="1" stopColor="#FFB253"></stop>
                  </linearGradient>
                  <clipPath id="clip0_3791_32364">
                    <rect
                      width="17"
                      height="20"
                      fill="white"
                      transform="translate(7.80005 6)"
                    ></rect>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="ml-3 text-xl font-semibold text-black">Aragon.ai</div>
          </div>

          {/* User Switcher */}
          <UserSwitcher currentUser={currentUser} onUserChange={setCurrentUser} />
        </header>
      </div>

      {/* Main Content */}
      <div className="relative max-h-[calc(100%-3.5rem)] w-full overflow-hidden overflow-y-auto">
        <div className="h-full w-full">
          <div className="max-w-[1400px] relative mt-4 flex w-full flex-col justify-between gap-10 px-8 pt-16 md:mt-8 md:flex-row mx-auto">
            {/* Left Panel - Upload Section */}
            <UploadSection
              onUploadComplete={handleUploadComplete}
              onStatusUpdate={handleStatusUpdate}
            />

            {/* Divider */}
            <div className="hidden w-1 h-[60vh] rounded-full bg-slate-200 md:flex"></div>

            {/* Right Panel - Uploaded Images */}
            <UploadedImagesPanel
              images={images}
              onStatusUpdate={handleStatusUpdate}
              onRemoveImage={handleRemoveImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
