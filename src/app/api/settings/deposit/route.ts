import { defaultDepositSettings, type DepositSettings, type NetworkType } from "@/lib/data-model";
import { adminDb } from "@/lib/firebase-admin";
import { FIRESTORE_PATHS } from "@/lib/firestore-paths";
import { requireSession } from "@/lib/request-session";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

function normalizeDepositSettings(rawData: Record<string, any>): DepositSettings {
  if (rawData.wallets && typeof rawData.wallets === "object") {
    return {
      ...defaultDepositSettings,
      ...rawData,
      wallets: {
        ...defaultDepositSettings.wallets,
        ...rawData.wallets,
      },
      activeNetwork: rawData.activeNetwork ?? rawData.network ?? defaultDepositSettings.activeNetwork,
    } as DepositSettings;
  }

  const network = (rawData.network as NetworkType) ?? defaultDepositSettings.activeNetwork;
  return {
    ...defaultDepositSettings,
    activeNetwork: network,
    wallets: {
      ...defaultDepositSettings.wallets,
      [network]: {
        qrCodeDataUrl: rawData.qrCodeDataUrl ?? defaultDepositSettings.wallets[network].qrCodeDataUrl,
        walletAddress: rawData.walletAddress ?? defaultDepositSettings.wallets[network].walletAddress,
        walletLabel: rawData.walletLabel ?? defaultDepositSettings.wallets[network].walletLabel,
        enabled: typeof rawData.enabled === "boolean" ? rawData.enabled : defaultDepositSettings.wallets[network].enabled,
      },
    },
  };
}

export async function GET() {
  const snapshot = await adminDb.doc(FIRESTORE_PATHS.depositSettings).get();
  return NextResponse.json({
    settings: snapshot.exists
      ? normalizeDepositSettings(snapshot.data() as Record<string, any>)
      : defaultDepositSettings,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (session.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, any>;
    const settingsToSave = body.wallets && typeof body.wallets === "object"
      ? normalizeDepositSettings(body)
      : normalizeDepositSettings(body);

    await adminDb.doc(FIRESTORE_PATHS.depositSettings).set(
      {
        ...settingsToSave,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
