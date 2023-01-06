export interface Subscription {
  appInstallation: {
    activeSubscriptions: {
      name: string;
      status: string;
      lineItems: {
        plan: {
          pricingDetails: {
            __typename: string;
            price: {
              amount: number;
              currencyCode: string;
            };
            interval: string;
          };
        };
      }[];
      trialDays: number;
      test: boolean;
    }[];
  };
}

export interface SubscriptionResponse {
  data: Subscription;
}

export interface SubscriptionConfirmResponse {
  data: {
    appInstallation: {
      activeSubscriptions: {
        test: boolean;
        createdAt: string;
        currentPeriodEnd: string;
        name: string;
        trialDays: number;
        status: string;
      }[];
    };
  };
}

export interface SubscriptionCancelResponse {
  data: {
    appSubscriptionCancel: {
      appSubscription: {
        id: string;
        status: string;
      };
      userErrors: {
        field: string;
        message: string;
      }[];
    };
  };
}

export interface SubscriptionCreateResponse {
  data: {
    appSubscriptionCreate: {
      name: string;
      returnUrl: string;
      trialDays: number;
      test: boolean;
      lineItems: {
        plan: {
          appRecurringPricingDetails: {
            price: {
              amount: number;
              currencyCode: string;
            };
          };
        };
      }[];
      userErrors: {
        field: string;
        message: string;
      }[];
      confirmationUrl: string;
      appSubscription: {
        id: string;
      };
    };
  };
}
