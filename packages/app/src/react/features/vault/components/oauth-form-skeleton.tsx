/**
 * OAuth Form Skeleton Component
 * 
 * Displays a loading skeleton for the OAuth connection form while resolving vault keys.
 */

import { Label } from '@src/react/shared/components/ui/label';

/**
 * Skeleton loader component for individual form fields
 */
function FieldSkeleton() {
  return (
    <div className="h-9 w-full bg-gray-200 animate-pulse rounded-md"></div>
  );
}

/**
 * Props for the OAuthFormSkeleton component
 */
interface OAuthFormSkeletonProps {
  /**
   * The OAuth service type to determine which fields to show
   */
  serviceType?: 'oauth' | 'oauth2' | 'oauth2_client_credentials' | 'none';
}

/**
 * Displays a skeleton loader for the OAuth connection form
 * Shows loading placeholders for all form fields
 */
export function OAuthFormSkeleton({ serviceType = 'none' }: OAuthFormSkeletonProps) {
  const showOAuth2Fields = serviceType === 'oauth2';
  const showOAuth1Fields = serviceType === 'oauth';
  const showClientCredentialsFields = serviceType === 'oauth2_client_credentials';
  const showScopeField = serviceType === 'oauth2';

  return (
    <div className="grid gap-4 py-4">
      {/* Name Field */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <div className="col-span-3">
          <FieldSkeleton />
        </div>
      </div>

      {/* Platform Field */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="platform">
          Platform <span className="text-red-500">*</span>
        </Label>
        <div className="col-span-3">
          <FieldSkeleton />
        </div>
      </div>

      {/* OAuth Service Selector */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="oauthService">
          Auth Service <span className="text-red-500">*</span>
        </Label>
        <div className="col-span-3">
          <FieldSkeleton />
        </div>
      </div>

      {/* OAuth 2.0 Fields */}
      {(showOAuth2Fields || showClientCredentialsFields) && (
        <>
          {showOAuth2Fields && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="authorizationURL">Auth URL</Label>
              <div className="col-span-3">
                <FieldSkeleton />
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tokenURL">Token URL</Label>
            <div className="col-span-3">
              <FieldSkeleton />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clientID">Client ID</Label>
            <div className="col-span-3">
              <FieldSkeleton />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="clientSecret">Client Secret</Label>
            <div className="col-span-3">
              <FieldSkeleton />
            </div>
          </div>
        </>
      )}

      {/* OAuth 1.0a Fields */}
      {showOAuth1Fields && (
        <>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="requestTokenURL">Request Token URL</Label>
            <div className="col-span-3">
              <FieldSkeleton />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="accessTokenURL">Access Token URL</Label>
            <div className="col-span-3">
              <FieldSkeleton />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userAuthorizationURL">User Auth URL</Label>
            <div className="col-span-3">
              <FieldSkeleton />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="consumerKey">Consumer Key</Label>
            <div className="col-span-3">
              <FieldSkeleton />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="consumerSecret">Consumer Secret</Label>
            <div className="col-span-3">
              <FieldSkeleton />
            </div>
          </div>
        </>
      )}

      {/* Scope Field */}
      {showScopeField && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="scope">Scopes</Label>
          <div className="col-span-3">
            <div className="h-20 w-full bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </div>
      )}

      {/* Loading message */}
      <div className="text-center text-sm text-gray-500 py-2">
        Loading connection details...
      </div>
    </div>
  );
}

