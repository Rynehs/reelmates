
interface DateSeparatorProps {
  date: string;
}

const DateSeparator = ({ date }: DateSeparatorProps) => {
  return (
    <div className="flex justify-center my-2">
      <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
        {date}
      </div>
    </div>
  );
};

export default DateSeparator;
