import { createBaseAccountSDK } from "@base-org/account";

// 전역 provider 인스턴스를 저장할 변수
let providerInstance: ReturnType<
  ReturnType<typeof createBaseAccountSDK>["getProvider"]
> | null = null;

/**
 * Base Account SDK Provider를 가져오거나 생성합니다
 * 싱글톤 패턴으로 중복 생성을 방지합니다
 */
export const getBaseAccountProvider = (chainId: number) => {
  if (!providerInstance) {
    const sdk = createBaseAccountSDK({
      appName: "BTC DCA Accounts Example",
      appLogoUrl: "https://base.org/logo.png",
      appChainIds: [chainId],
    });

    providerInstance = sdk.getProvider();
  }

  return providerInstance;
};

/**
 * 개발 모드용 더미 provider (실제 wallet 연결 없이 테스트용)
 */
export const getDevProvider = () => {
  return {
    request: async (params: any) => {
      console.log("🚀 Dev mode: Mock provider request", params);

      // 개발 모드에서는 더미 응답 반환
      if (params.method === "eth_requestAccounts") {
        return ["0x742d35Cc6634C0532925a3b8D8C9c2a8c9C2a8c9"];
      }

      if (params.method === "wallet_connect") {
        return {
          accounts: [{ address: "0x742d35Cc6634C0532925a3b8D8C9c2a8c9C2a8c9" }],
          signInWithEthereum: {
            message: "Dev mode message",
            signature: "0xdevsignature",
          },
        };
      }

      if (params.method === "personal_sign") {
        return "0xdevsignature";
      }

      return null;
    },
  } as any;
};

/**
 * 환경에 따라 적절한 provider를 반환합니다
 */
export const getProvider = (chainId: number) => {
  const isDevMode = process.env.NEXT_PUBLIC_NODE_ENV === "development" || false; // 개발 중에는 항상 true

  if (isDevMode) {
    return getDevProvider();
  }

  return getBaseAccountProvider(chainId);
};
