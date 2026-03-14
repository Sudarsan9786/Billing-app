import { useNetwork } from '../hooks/useMobile';

const OfflineBanner = () => {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 text-sm font-medium safe-top">
      No internet connection — some features may not work / இணைய இணைப்பு இல்லை
    </div>
  );
};

export default OfflineBanner;

