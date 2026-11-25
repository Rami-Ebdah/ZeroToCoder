using Microsoft.EntityFrameworkCore;
using ZeroToCoder.Api.Models;

namespace ZeroToCoder.Api.Data;

/// <summary>
/// The schema is database-first (no EF migrations). Table names come from the DbSet
/// property names, so do not rename these properties without renaming the tables.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<Bundle> Bundles => Set<Bundle>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<FAQ> FAQs => Set<FAQ>();

    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Reply> Replies => Set<Reply>();
    public DbSet<PostLike> PostLikes => Set<PostLike>();
    public DbSet<ReplyLike> ReplyLikes => Set<ReplyLike>();
    public DbSet<PostReport> PostReports => Set<PostReport>();
    public DbSet<ReplyReport> ReplyReports => Set<ReplyReport>();

    public DbSet<JobPost> JobPosts => Set<JobPost>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    public DbSet<Course> Courses => Set<Course>();
    public DbSet<CourseCategory> CourseCategories => Set<CourseCategory>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Instructor> Instructors => Set<Instructor>();
    public DbSet<LearningOutcome> LearningOutcomes => Set<LearningOutcome>();
    public DbSet<SyllabusWeek> SyllabusWeeks => Set<SyllabusWeek>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<CourseReview> CourseReviews => Set<CourseReview>();

    public DbSet<Roadmap> Roadmaps => Set<Roadmap>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<JobPost>().HasKey(j => j.JobID);

        modelBuilder.Entity<JobApplication>().HasKey(a => a.ApplicationID);
        modelBuilder.Entity<JobApplication>()
            .HasOne(a => a.Job)
            .WithMany(j => j.Applications)
            .HasForeignKey(a => a.JobID);

        modelBuilder.Entity<Course>()
            .HasMany(c => c.Categories)
            .WithOne(cc => cc.Course)
            .HasForeignKey(cc => cc.CourseID);

        modelBuilder.Entity<Enrollment>()
            .HasIndex(e => new { e.UserID, e.CourseID })
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}
