import Card_GoogleDriveFile from '@/app/dashboard/picker/Card_GoogleDriveFile';

export default async function DriveTestPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Google Drive Test</h1>

      <Card_GoogleDriveFile />
    </div>
  );
}