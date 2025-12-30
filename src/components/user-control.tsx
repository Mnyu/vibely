'use client';

import { UserButton } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useCurrentTheme } from '@/hooks/use-current-theme';

interface Props {
  showName?: boolean;
}

const UserControl = ({ showName }: Props) => {
  const currentTheme = useCurrentTheme();
  return (
    <UserButton
      showName={showName}
      appearance={{
        theme: currentTheme === 'dark' ? dark : undefined,
        elements: {
          userButtonBox: 'rounded-md!',
          userButtonAvatarBox: 'rounded-md! size-8!',
          userButtonTrigger: 'rounded-md!',
        },
      }}
    />
  );
};
export default UserControl;
