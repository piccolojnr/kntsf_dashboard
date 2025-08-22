import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PermitDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-9" />
          <div>
            <Skeleton className="w-48 h-9 mb-2" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-24 h-9" />
          <Skeleton className="w-32 h-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Permit Status Card */}
          <Card>
            <CardHeader>
              <Skeleton className="w-32 h-6" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-20 h-6" />
                <div className="text-right">
                  <Skeleton className="w-24 h-4 mb-2" />
                  <Skeleton className="w-16 h-8" />
                </div>
              </div>
              <Skeleton className="w-full h-px" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="w-20 h-4 mb-2" />
                  <Skeleton className="w-32 h-5" />
                </div>
                <div>
                  <Skeleton className="w-20 h-4 mb-2" />
                  <Skeleton className="w-32 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Information */}
          <Card>
            <CardHeader>
              <Skeleton className="w-40 h-6" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="w-20 h-4 mb-2" />
                    <Skeleton className="w-32 h-5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <Skeleton className="w-40 h-6" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="w-24 h-4 mb-2" />
                    <Skeleton className="w-32 h-5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Permit Details */}
          <Card>
            <CardHeader>
              <Skeleton className="w-32 h-6" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="w-24 h-4 mb-2" />
                  <Skeleton className="w-32 h-5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <Skeleton className="w-28 h-6" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="w-full h-9" />
              <Skeleton className="w-full h-9" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
