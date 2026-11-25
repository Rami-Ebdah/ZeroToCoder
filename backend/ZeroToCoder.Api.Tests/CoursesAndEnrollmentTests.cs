using System.Net;
using System.Net.Http.Json;
using ZeroToCoder.Api.Common;
using ZeroToCoder.Api.Dtos;
using ZeroToCoder.Api.Models;
using ZeroToCoder.Api.Tests.Infrastructure;

namespace ZeroToCoder.Api.Tests;

public class CoursesAndEnrollmentTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task GetCourses_HandlesCoursesWithNullRatingStudentsAndPrice()
    {
        await factory.WithDbAsync(async db =>
        {
            db.Courses.Add(new Course { CourseTitle = "Bare course" });
            await db.SaveChangesAsync();
        });

        var response = await factory.CreateClient().GetAsync("/api/courses");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CourseWrites_RequireAdmin()
    {
        var anonymous = factory.CreateClient();
        var user = await factory.CreateClientAsync();
        var payload = new { courseTitle = "New", category = new[] { "Web" } };

        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.PostAsJsonAsync("/api/courses", payload)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await user.PostAsJsonAsync("/api/courses", payload)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await user.DeleteAsync("/api/courses/1")).StatusCode);
    }

    [Fact]
    public async Task Admin_CanCreateUpdateAndDeleteCourse()
    {
        var admin = await factory.CreateClientAsync(Roles.Admin);

        var create = await admin.PostAsJsonAsync("/api/courses", new
        {
            courseTitle = "Admin course",
            description = "Saved on create",
            price = 25.5,
            category = new[] { "Web", "web", " " },
        });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        var created = await create.Content.ReadFromJsonAsync<CourseDto>();

        var details = await admin.GetFromJsonAsync<CourseDetailsDto>($"/api/courses/{created!.Id}");
        Assert.Equal("Saved on create", details!.Description);
        Assert.Equal(["Web"], details.Category);

        var update = await admin.PutAsJsonAsync($"/api/courses/{created.Id}", new { courseTitle = "Renamed", category = (string[]?)null });
        Assert.Equal(HttpStatusCode.NoContent, update.StatusCode);

        Assert.Equal(HttpStatusCode.NoContent, (await admin.DeleteAsync($"/api/courses/{created.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await admin.GetAsync($"/api/courses/{created.Id}")).StatusCode);
    }

    [Fact]
    public async Task Enroll_ValidatesCourseAndDuplicates()
    {
        var client = await factory.CreateClientAsync();
        var course = await factory.CreateCourseAsync();

        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsync("/api/enrollments/999999", null)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsync($"/api/enrollments/{course.CourseID}", null)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsync($"/api/enrollments/{course.CourseID}", null)).StatusCode);

        var myLearning = await client.GetFromJsonAsync<List<MyLearningCourseDto>>("/api/mylearning");
        Assert.Contains(myLearning!, c => c.Id == course.CourseID);
    }

    [Fact]
    public async Task MyLearning_OnlyShowsTheCallersCourses()
    {
        var alice = await factory.CreateClientAsync();
        var bob = await factory.CreateClientAsync();
        var course = await factory.CreateCourseAsync();
        await alice.PostAsync($"/api/enrollments/{course.CourseID}", null);

        var bobsCourses = await bob.GetFromJsonAsync<List<MyLearningCourseDto>>("/api/mylearning");

        Assert.Empty(bobsCourses!);
    }

    [Fact]
    public async Task Review_RequiresEnrollmentAndUsesTokenIdentity()
    {
        var user = await factory.CreateUserAsync();
        var client = await factory.CreateClientForAsync(user);
        var course = await factory.CreateCourseAsync();
        var review = new { courseID = course.CourseID, rating = 5, comment = "Great", userID = 1 };

        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/courses/review", review)).StatusCode);

        await client.PostAsync($"/api/enrollments/{course.CourseID}", null);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsJsonAsync("/api/courses/review", review)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await client.PostAsJsonAsync("/api/courses/review", review)).StatusCode);

        var details = await client.GetFromJsonAsync<CourseDetailsDto>($"/api/courses/{course.CourseID}");
        Assert.Equal(user.UserID, Assert.Single(details!.Reviews).UserID);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public async Task Review_RejectsOutOfRangeRatings(int rating)
    {
        var client = await factory.CreateClientAsync();
        var response = await client.PostAsJsonAsync("/api/courses/review", new { courseID = 1, rating });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task BundleEnrollment_EnrollsInMatchingCourses()
    {
        var admin = await factory.CreateClientAsync(Roles.Admin);
        var user = await factory.CreateClientAsync();
        var a = await factory.CreateCourseAsync("A");
        var b = await factory.CreateCourseAsync("B");

        var create = await admin.PostAsJsonAsync("/api/bundles", new
        {
            name = "Pack",
            courses = $"{a.CourseTitle}, {b.CourseTitle}, Missing course",
            originalPrice = 100,
            discountedPrice = 60,
        });
        var bundle = await create.Content.ReadFromJsonAsync<BundleDto>();

        await user.PostAsync($"/api/enrollments/{a.CourseID}", null);
        var result = await user.PostAsync($"/api/bundles/enroll/{bundle!.BundleID}", null);
        var json = await result.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
        Assert.Contains(b.CourseTitle!, json);
        Assert.Contains("Missing course", json);
        Assert.Equal(2, (await user.GetFromJsonAsync<List<MyLearningCourseDto>>("/api/mylearning"))!.Count);
    }

    [Fact]
    public async Task Bundle_RejectsDiscountAboveOriginalPrice()
    {
        var admin = await factory.CreateClientAsync(Roles.Admin);
        var response = await admin.PostAsJsonAsync("/api/bundles", new { name = "Bad", courses = "x", originalPrice = 10, discountedPrice = 20 });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Coupons_ValidateDiscountAndUniqueCode()
    {
        var admin = await factory.CreateClientAsync(Roles.Admin);
        var code = "C" + Guid.NewGuid().ToString("N")[..8];

        Assert.Equal(HttpStatusCode.BadRequest, (await admin.PostAsJsonAsync("/api/coupons", new { code, discount = 150 })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await admin.PostAsJsonAsync("/api/coupons", new { code, discount = 15 })).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await admin.PostAsJsonAsync("/api/coupons", new { code, discount = 15 })).StatusCode);
    }
}
