import { ApiProperty } from "@nestjs/swagger";
import { HttpStatus } from "@nestjs/common";

export class BaseMaper {
    @ApiProperty({
        title: "Title",
        description: "Title of the response",
        example: "Success",
    })
    title: string;

    @ApiProperty({
        description: "Message of the response",
        example: "Success",
    })
    message: string;
    
    @ApiProperty({
        description: "Error of the response",
        example: false,
    })
    error: boolean = false;

    @ApiProperty({
        description: "Status code of the response",
        example: 200,
    })
    statusCode: number = HttpStatus.OK;

    @ApiProperty({
        description: "The response data",
        default: null
    })
    data: any;
}