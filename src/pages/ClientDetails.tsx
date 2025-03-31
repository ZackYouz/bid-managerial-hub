
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { Client } from '@/types';
import { getClientById } from '@/services/dataService';

const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const isNewClient = id === 'new';

  useEffect(() => {
    if (isNewClient) {
      setClient(null);
      setLoading(false);
      return;
    }

    // Load client data
    const loadClient = async () => {
      try {
        if (id) {
          const fetchedClient = getClientById(id);
          if (fetchedClient) {
            setClient(fetchedClient);
          } else {
            // Client not found
            navigate('/clients');
          }
        }
      } catch (error) {
        console.error('Error loading client:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [id, isNewClient, navigate]);

  const handleGoBack = () => {
    navigate('/clients');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
        
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isNewClient ? 'Create New Client' : 'Edit Client'}</CardTitle>
          <CardDescription>
            {isNewClient 
              ? 'Register a new client with all necessary information' 
              : `Managing ${client?.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p className="text-muted-foreground">
              Full client form implementation coming soon. This page will include all fields for creating/editing clients as per your requirements.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetails;
