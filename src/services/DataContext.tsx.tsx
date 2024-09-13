import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useTensorflowModel } from 'react-native-fast-tflite';
import imageController from '../controllers/imageController';

type DataContextType = {
  data: { fileName: string; url: string; classes: string[] }[];
  isLoading: boolean;
  uploadImage: (() => Promise<any>) | null;
  uploadImageToDatabase: ((uri: string, labels: string[]) => Promise<void>) | null;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

type DataProviderProps = {
  children: ReactNode;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<{ fileName: string; url: string; classes: string[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadImage, setUploadImage] = useState<(() => Promise<any>) | null>(null);
  const [uploadImageToDatabase, setUploadImageToDatabase] = useState<((uri: string, labels: string[]) => Promise<void>) | null>(null);

  const model1 = useTensorflowModel(require('../assets/major1.tflite'));


  useEffect(() => {
    const initializeController = async () => {
      if (model1) {
        const imgController = imageController(model1);
        setUploadImage(() => imgController.uploadImage);
        // 使用類型斷言來確保類型匹配
        setUploadImageToDatabase(() => imgController.uploadImageToDatabase as (uri: string, labels: string[]) => Promise<void>);

        try {
          const result = await imgController.listAll();
          setData(result);
        } catch (error) {
          console.error("Error loading data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeController();
  }, [model1]);

  return (
    <DataContext.Provider value={{ data, isLoading, uploadImage, uploadImageToDatabase }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};