import React, { createContext, useState, useEffect, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import { useTensorflowModel } from 'react-native-fast-tflite';
import imageController from '../controllers/imageController';

type DataItem = {
  fileName: string;
  url: string;
  classes: string[];
};
type LoveOutfit = {
  id: string;
  top: string;
  bottom: string;
};
type DataContextType = {
  data: DataItem[];
  loveData:LoveOutfit[];
  setData: Dispatch<SetStateAction<DataItem[]>>;
  setloveData:Dispatch<SetStateAction<LoveOutfit[]>>;
  isLoading: boolean;
  uploadImage: (() => Promise<any>) | null;
  uploadImageToDatabase: ((uri: string, labels: string[]) => Promise<void>) | null;
  uploadModel: ((uri: string) => Promise<void>) | null;
  getModelImageFromFirebase: (() => Promise<string | undefined>) | null;
  modelImage: string | null;
  setModelImage: Dispatch<SetStateAction<string | null>>;
  getLoveList: (() => Promise<{ id: string; top: any; bottom: any; }[] | undefined>) | null;
  processLoveOutfit: ((outfit: { top: string; bottom: string; }, processType: number, outfitId: number) => Promise<number|null|undefined>) | null;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

type DataProviderProps = {
  children: ReactNode;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loveData,setloveData]= useState<LoveOutfit[]>([]);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadImage, setUploadImage] = useState<(() => Promise<any>) | null>(null);
  const [uploadImageToDatabase, setUploadImageToDatabase] = useState<((uri: string, labels: string[]) => Promise<void>) | null>(null);
  const [uploadModel, setUploadModel] = useState<((uri: string) => Promise<any>) | null>(null); // 新增的 state
  const model1 = useTensorflowModel(require('../assets/major1.tflite'));
  const [getModelImageFromFirebase, setGetModelImageFromFirebase] = useState<(() => Promise<string | undefined>) | null>(null);
  const [getLoveList, setGetLoveList] = useState<(() => Promise<{ id: string; top: any; bottom: any; }[] | undefined>) | null>(null);
  const [processLoveOutfit, setprocessLoveOutfit] = useState<((outfit: any, processType: any, outfitId: any) => Promise<number|null|undefined>) | null>(null);
  useEffect(() => {
    const initializeController = async () => {
      if (model1) {
        const imgController = imageController(model1);
        setUploadImage(() => imgController.uploadImage);
        setUploadImageToDatabase(() => imgController.uploadImageToDatabase as (uri: string, labels: string[]) => Promise<void>);
        setUploadModel(() => imgController.uploadModel); // 設置 uploadModel 方法
        setGetModelImageFromFirebase(() => imgController.getModelImageFromFirebase);
        setGetLoveList(imgController.getLoveList);
        setprocessLoveOutfit(()=>imgController.processLoveOutfit)
        try {
          const result = await imgController.listAll();
          
          console.log(result)
          setData(result);
          if (imgController.getModelImageFromFirebase) {
            const modelImageUrl = await imgController.getModelImageFromFirebase();
            if(modelImageUrl!='')
            setModelImage(modelImageUrl||null);
          }
        } catch (error) {
          console.error("Error loading data:", error);
        } 
        try{
          const loveResult=await imgController.getLoveList();
          if(loveResult){
            setloveData(loveResult)
          }
        }
        catch(error){
          console.error("Error loading Love data:", error);
        }
        setIsLoading(false);
      }
    };

    initializeController();
  }, [model1]);

  return (
    <DataContext.Provider value={{ data, setData, isLoading, uploadImage, uploadImageToDatabase, uploadModel,modelImage,setModelImage,getModelImageFromFirebase,getLoveList,loveData,setloveData,processLoveOutfit  }}>
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