namespace ViewDiagrams.Models.ViewModel
{
	public class ProfileViewModel
	{
		//public List<Workspace> Workspaces { get; set; }
		public User User { get; set; }

		public ProfileViewModel(User user)
		{
			User = user;
		}
	}
}
