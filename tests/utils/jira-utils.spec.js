import { describe, beforeEach, it, expect, vi, afterEach } from 'vitest';
import { convertDescriptionToText, fetchJiraVersions, sortTicketsByTeams } from '_utils/jira-utils.js';

describe('fetchJiraVersions', () => {
    let mockClient;

    beforeEach(() => {
        // Setup mock client and stub console methods
        mockClient = { get: vi.fn() };
        global.console.log = vi.fn();
        global.console.error = vi.fn();
    });

    afterEach(() => {
        // Restore console methods to their original implementations
        global.console.log.mockRestore();
        global.console.error.mockRestore();
    });

    it('should fetch versions successfully and return filtered, sorted, and trimmed list', async () => {
        // Provide mock data for a successful fetch
        mockClient.get.mockResolvedValue({
            data: [
                { name: 'Project 2.0.0', releaseDate: '2023-01-02' },
                { name: 'Project 1.0.0', releaseDate: '2023-01-01' },
                { name: 'Project 3.0.0', releaseDate: '2023-01-03' },
            ],
        });

        const versions = await fetchJiraVersions(mockClient, 'PROJ', 'Project');

        // Verify the output matches expected sorted and filtered results
        expect(versions).toHaveLength(3);
        expect(versions[0].name).toBe('Project 3.0.0');
        expect(versions[1].name).toBe('Project 2.0.0');
        expect(versions[2].name).toBe('Project 1.0.0');
    });

    it('should handle the case where no versions match the filter prefix', async () => {
        // Mock response when no versions match the filter
        mockClient.get.mockResolvedValue({
            data: [{ name: 'Other 1.0.0', releaseDate: '2023-01-04' }],
        });

        const versions = await fetchJiraVersions(mockClient, 'PROJ', 'Project');

        // Expect no versions to be returned
        expect(versions).toHaveLength(0);
    });

    it('should throw an error if the request fails', async () => {
        // Simulate a network error
        mockClient.get.mockRejectedValue(new Error('Network error'));

        // Verify that the error is thrown as expected
        await expect(fetchJiraVersions(mockClient, 'PROJ', 'Project')).rejects.toThrow('Network error');
    });
});

describe('convertDescriptionToText', () => {

    it('should return an empty string for null or undefined descriptions', () => {
        expect(convertDescriptionToText(null)).toBe('');
        expect(convertDescriptionToText(undefined)).toBe('');
    });

    it('should convert simple text content correctly', () => {
        const description = {
            content: [
                {
                    type: 'paragraph',
                    content: [{ text: 'Simple text content.' }]
                }
            ]
        };
        expect(convertDescriptionToText(description)).toBe('Simple text content.');
    });

    it('should apply markdown to strong text', () => {
        const description = {
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { text: 'Bold', marks: [{ type: 'strong' }] },
                        { text: ' and normal text.' }
                    ]
                }
            ]
        };
        expect(convertDescriptionToText(description)).toBe('**Bold** and normal text.');
    });

    it('should prepend headings with the correct number of hashes', () => {
        const description = {
            content: [
                {
                    type: 'heading',
                    attrs: { level: 2 },
                    content: [{ text: 'Heading' }]
                },
                {
                    type: 'paragraph',
                    content: [{ text: 'Text under heading.' }]
                }
            ]
        };
        expect(convertDescriptionToText(description)).toBe('## Heading\nText under heading.');
    });
});

describe('sortTicketsByTeams', () => {
    let cachedEnv;

    beforeEach(() => {
        // Save the original process.env
        cachedEnv = process.env;
    });

    afterEach(() => {
        // Restore the original process.env after each test
        process.env = cachedEnv;
    });

    it('should sort tickets into teams based on environment configuration', () => {
        // Mock the environment variable
        process.env.JIRA_TEAM_NAMES = 'TeamA,TeamB,TeamC';

        const tickets = [
            { team: 'TeamA', ticketNumber: 'A-1', summary: 'Ticket A1', copyAIDescription: 'Description A1', isCustomerFacing: true },
            { team: 'TeamB', ticketNumber: 'B-1', summary: 'Ticket B1', copyAIDescription: 'Description B1', isCustomerFacing: false },
            { team: 'TeamC', ticketNumber: 'C-1', summary: 'Ticket C1', copyAIDescription: 'Description C1', isCustomerFacing: true },
            { team: 'TeamA', ticketNumber: 'A-2', summary: 'Ticket A2', copyAIDescription: 'Description A2', isCustomerFacing: false },
        ];

        const expected = [
            {
                name: 'TeamA',
                tickets: [
                    { ticket: 'A-1', title: 'Ticket A1', summary: 'Description A1', customerFacing: true },
                    { ticket: 'A-2', title: 'Ticket A2', summary: 'Description A2', customerFacing: false },
                ],
            },
            {
                name: 'TeamB',
                tickets: [
                    { ticket: 'B-1', title: 'Ticket B1', summary: 'Description B1', customerFacing: false },
                ],
            },
            {
                name: 'TeamC',
                tickets: [
                    { ticket: 'C-1', title: 'Ticket C1', summary: 'Description C1', customerFacing: true },
                ],
            },
        ];

        expect(sortTicketsByTeams(tickets)).toEqual(expected);
    });

    it('should return an empty array if no team names are configured', () => {
        // Ensure no environment variable is set
        delete process.env.JIRA_TEAM_NAMES;

        const tickets = [
            { team: 'TeamA', ticketNumber: 'A-1', summary: 'Ticket A1', copyAIDescription: 'Description A1', isCustomerFacing: true },
        ];

        expect(sortTicketsByTeams(tickets)).toEqual([]);
    });

    it('should handle tickets with teams not listed in the environment configuration', () => {
        // Mock the environment variable with a single team
        process.env.JIRA_TEAM_NAMES = 'TeamA';

        const tickets = [
            { team: 'TeamA', ticketNumber: 'A-1', summary: 'Ticket A1', copyAIDescription: 'Description A1', isCustomerFacing: true },
            { team: 'TeamX', ticketNumber: 'X-1', summary: 'Ticket X1', copyAIDescription: 'Description X1', isCustomerFacing: false },
        ];

        const expected = [
            {
                name: 'TeamA',
                tickets: [
                    { ticket: 'A-1', title: 'Ticket A1', summary: 'Description A1', customerFacing: true },
                ],
            },
        ];

        expect(sortTicketsByTeams(tickets)).toEqual(expected);
    });
});
