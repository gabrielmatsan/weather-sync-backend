export interface ISensorsRepository {
  getNewSensorsData(): Promise<
    {
      placeId: number;
      waterLevel: number;
      waterLevelUnit: string;
      createdAt: Date;
    }[]
  >;
}
