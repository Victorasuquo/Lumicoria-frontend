import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileTextIcon, ImageIcon, FileIcon, Download, Trash2, Settings2, Upload, Search, Filter } from 'lucide-react';
import { Document, documentApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const docs = await documentApi.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch documents',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleUploadDocument = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    fileInput.click();

    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        setIsLoading(true);
        
        try {
          const response = await documentApi.uploadDocument(file);
          setDocuments(prev => [response.document, ...prev]);
          toast({
            title: 'Document uploaded',
            description: response.message || 'Document successfully uploaded'
          });
        } catch (error) {
          console.error('Error uploading document:', error);
          toast({
            title: 'Upload failed',
            description: 'Failed to upload document. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
  };

  const handleDeleteSelected = async () => {
    if (selectedDocuments.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedDocuments.length} selected document(s)?`)) {
      return;
    }
    
    setIsLoading(true);
    const deletePromises = selectedDocuments.map(id => documentApi.deleteDocument(id));
    
    try {
      await Promise.all(deletePromises);
      setDocuments(docs => docs.filter(doc => !selectedDocuments.includes(doc.id)));
      setSelectedDocuments([]);
      toast({
        title: 'Documents deleted',
        description: `${selectedDocuments.length} document(s) successfully deleted`
      });
    } catch (error) {
      console.error('Error deleting documents:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete some documents. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments(prev => {
      if (prev.includes(id)) {
        return prev.filter(docId => docId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Button onClick={handleUploadDocument} disabled={isLoading}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            type="search" 
            placeholder="Search documents..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        {selectedDocuments.length > 0 && (
          <Button variant="destructive" onClick={handleDeleteSelected}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedDocuments.length})
          </Button>
        )}
      </div>

      {isLoading && documents.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-gray-500">
            {searchQuery ? 'Try adjusting your search terms' : 'Upload your first document to get started'}
          </p>
          {searchQuery ? (
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          ) : (
            <Button className="mt-4" onClick={handleUploadDocument}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className={`overflow-hidden border ${
              selectedDocuments.includes(doc.id) ? 'border-purple-500 ring-2 ring-purple-200' : ''
            }`}>
              <div className="p-4 flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div 
                    className="p-2 bg-purple-100 rounded-lg cursor-pointer"
                    onClick={() => toggleDocumentSelection(doc.id)}
                  >
                    {doc.file_type === 'application/pdf' ? (
                      <FileTextIcon className="h-6 w-6 text-purple-600" />
                    ) : doc.file_type.includes('image/') ? (
                      <ImageIcon className="h-6 w-6 text-purple-600" />
                    ) : (
                      <FileIcon className="h-6 w-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-gray-500">
                      {doc.file_type.split('/')[1].toUpperCase()} • {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent>
                <div className="flex justify-between text-sm pt-2">
                  <div>Status: <strong>{doc.status}</strong></div>
                  <div>Size: <strong>{Math.round(doc.file_size / 1024)} KB</strong></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;
