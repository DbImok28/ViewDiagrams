namespace ViewDiagrams.Models.ViewModel
{
    public class InputField
    {
        public InputField(string name, string value, InputControlState state = InputControlState.None)
        {
            Name = name;
            Value = value;
            State = state;
        }

        public string Name { get; set; }
        public string Value { get; set; }
        public InputControlState State { get; set; }
    }
}
