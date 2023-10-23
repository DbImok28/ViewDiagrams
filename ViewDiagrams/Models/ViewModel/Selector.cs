namespace ViewDiagrams.Models.ViewModel
{
    public class Selector
    {
        public Selector(string name, List<string> values, int selectedIndex = 0)
        {
            Name = name;
            Values = values;
            SelectedIndex = selectedIndex;
        }

        public string Name { get; set; }
        public List<string> Values { get; set; }
        public int SelectedIndex { get; set; }
    }
}
