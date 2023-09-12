export interface AppInstallationIdResponse {
  data: {
    currentAppInstallation: {
      id: string;
    };
  };
}

export interface AppMetafieldsResponse {
  data: {
    currentAppInstallation: {
      metafields: {
        edges: {
          node: {
            id: string;
            namespace: string;
            key: string;
            value: string;
          };
        }[];
      };
    };
  };
}
