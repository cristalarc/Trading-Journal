import { CommentCard } from "./comment-card"

interface Comment {
  id: string
  date: string
  timeframe: "Weekly" | "Daily" | "Hourly"
  comment: string
}

interface TimeTableProps {
  comments: Comment[]
}

export function TimeTable({ comments }: TimeTableProps) {
  const weeklyComments = comments.filter((c) => c.timeframe === "Weekly")
  const dailyComments = comments.filter((c) => c.timeframe === "Daily")
  const hourlyComments = comments.filter((c) => c.timeframe === "Hourly")

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      <div className="overflow-y-auto">
        <h3 className="font-bold mb-2">Weekly</h3>
        {weeklyComments.map((comment) => (
          <CommentCard key={comment.id} date={comment.date} comment={comment.comment} timeframe={comment.timeframe} />
        ))}
      </div>
      <div className="overflow-y-auto">
        <h3 className="font-bold mb-2">Daily</h3>
        {dailyComments.map((comment) => (
          <CommentCard key={comment.id} date={comment.date} comment={comment.comment} timeframe={comment.timeframe} />
        ))}
      </div>
      <div className="overflow-y-auto">
        <h3 className="font-bold mb-2">Hourly</h3>
        {hourlyComments.map((comment) => (
          <CommentCard key={comment.id} date={comment.date} comment={comment.comment} timeframe={comment.timeframe} />
        ))}
      </div>
    </div>
  )
}

