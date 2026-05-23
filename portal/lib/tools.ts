export type EnvironmentId =
  | "internet"
  | "ace"
  | "mcc"
  | "anzC"
  | "anzS";

export type AvailabilityStatus =
  | "available"
  | "early-access"
  | "planned"
  | "unspecified";

export type AvailabilityMap = Partial<
  Record<EnvironmentId, AvailabilityStatus>
>;

export const ENVIRONMENTS: ReadonlyArray<{
  id: EnvironmentId;
  label: string;
}> = [
  { id: "internet", label: "Internet" },
  { id: "ace", label: "ACE" },
  { id: "mcc", label: "MCC" },
  { id: "anzC", label: "ANZ C" },
  { id: "anzS", label: "ANZ S" },
];

export function isToolAvailable(availability?: AvailabilityMap): boolean {
  if (!availability) return false;
  return Object.values(availability).some(
    (s) => s === "available" || s === "early-access",
  );
}

export function hasAnyEnvironmentInfo(
  availability?: AvailabilityMap,
): boolean {
  if (!availability) return false;
  return Object.values(availability).some(
    (s) => s === "available" || s === "early-access" || s === "planned",
  );
}
