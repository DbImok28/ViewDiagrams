using System.Security.Claims;
using System.Security.Principal;

namespace ViewDiagrams.Models.Helpers
{
    public static class UserHelpers
    {
        public static int GetUserId(this IPrincipal principal)
        {
            var claimsIdentity = (ClaimsIdentity)principal.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);
            return Convert.ToInt32(claim.Value);
        }
    }
}
