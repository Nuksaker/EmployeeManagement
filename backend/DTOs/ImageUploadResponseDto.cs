using System.Text.Json.Serialization;

namespace EmployeeManagement.Api.DTOs;

public class ImageUploadResponseDto
{
    [JsonPropertyName("Photo")]
    public string Photo { get; set; } = string.Empty;

    [JsonPropertyName("File_Name")]
    public string FileName { get; set; } = string.Empty;
}
