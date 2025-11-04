import {
	NodeOperationError,
	type IExecuteFunctions,
	type IDataObject,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type IHttpRequestOptions,
} from 'n8n-workflow';

export class SttGateway implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LLM Gateway (Chat)',
		name: 'bozonxSttGateway',
		group: ['output'],
		version: 1,
		description: 'Synchronous chat completion via LLM Gateway microservice',
		defaults: { name: 'LLM Gateway (Chat)' },
		icon: 'file:stt-gateway.svg',
		documentationUrl: 'https://github.com/bozonx/llm-gateway-microservice/tree/main/n8n-nodes-bozonx-llm-gateway-microservice#readme',
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		requestDefaults: {
			baseURL: '={{$credentials.gatewayUrl}}',
			headers: {
				Accept: 'application/json',
			},
		},
		credentials: [
			{
				name: 'bozonxMicroservicesApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Base Path',
				name: 'basePath',
				type: 'string',
				default: 'api/v1',
				description: 'API base path appended to the Gateway URL (leading/trailing slashes are ignored)',
			},
			{
				displayName: 'Provider',
				name: 'provider',
				type: 'options',
				options: [
					{ name: 'OpenAI', value: 'openai' },
					{ name: 'Anthropic', value: 'anthropic' },
					{ name: 'DeepSeek', value: 'deepseek' },
					{ name: 'OpenRouter', value: 'openrouter' },
				],
				default: 'openai',
				required: true,
				description: 'LLM provider',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: '',
				required: true,
				description: 'Model name (e.g., gpt-4o-mini, claude-3-5-sonnet-latest, deepseek-chat, openrouter/auto)',
			},
			{
				displayName: 'System Message',
				name: 'systemMessage',
				type: 'string',
				default: '',
				required: false,
				description: 'Optional system prompt',
			},
			{
				displayName: 'User Message',
				name: 'userMessage',
				type: 'string',
				default: '',
				required: true,
				description: 'User message content',
			},
			{
				displayName: 'Temperature',
				name: 'temperature',
				type: 'number',
				default: 0.7,
				required: false,
				description: 'Sampling temperature (0-2)',
			},
			{
				displayName: 'Top P',
				name: 'topP',
				type: 'number',
				default: 1,
				required: false,
				description: 'Nucleus sampling probability (0-1)',
			},
			{
				displayName: 'Max Tokens',
				name: 'maxTokens',
				type: 'number',
				default: 256,
				required: false,
				description: 'Maximum tokens to generate',
			},
			{
				displayName: 'Provider Options (JSON)',
				name: 'providerOptions',
				type: 'string',
				default: '',
				required: false,
				description: 'Optional JSON object with native provider parameters',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const provider = this.getNodeParameter('provider', i) as string;
				const model = this.getNodeParameter('model', i) as string;
				const systemMessage = (this.getNodeParameter('systemMessage', i) as string) || '';
				const userMessage = this.getNodeParameter('userMessage', i) as string;
				const temperature = this.getNodeParameter('temperature', i, undefined) as number | undefined;
				const topP = this.getNodeParameter('topP', i, undefined) as number | undefined;
				const maxTokens = this.getNodeParameter('maxTokens', i, undefined) as number | undefined;
				const providerOptionsRaw = (this.getNodeParameter('providerOptions', i, '') as string) || '';
				const basePathParam = (this.getNodeParameter('basePath', i) as string) || '';
				const normalizedBasePath = basePathParam.replace(/^\/+|\/+$/g, '');
				const pathPrefix = normalizedBasePath ? `${normalizedBasePath}/` : '';

				if (!userMessage) {
					throw new NodeOperationError(this.getNode(), 'User Message is required', { itemIndex: i });
				}

				const creds = await this.getCredentials('bozonxMicroservicesApi');
				let baseURL = ((creds?.gatewayUrl as string) || '').trim();
				if (!baseURL) {
					throw new NodeOperationError(this.getNode(), 'Gateway URL is required in credentials', { itemIndex: i });
				}
				if (!/^https?:\/\//i.test(baseURL)) {
					throw new NodeOperationError(this.getNode(), 'Gateway URL must include protocol (http:// or https://)', { itemIndex: i });
				}
				baseURL = baseURL.replace(/\/+$/g, '');

				const options: IHttpRequestOptions = {
					method: 'POST',
					url: `${pathPrefix}llm/chat`,
					json: true,
					body: (() => {
						const body: IDataObject = {
							provider,
							model,
							messages: [
								...(systemMessage ? [{ role: 'system', content: systemMessage }] : []),
								{ role: 'user', content: userMessage },
							],
						} as IDataObject;
						if (typeof temperature === 'number') {
							(body as IDataObject).temperature = temperature;
						}
						if (typeof topP === 'number') {
							(body as IDataObject).top_p = topP;
						}
						if (typeof maxTokens === 'number') {
							(body as IDataObject).max_tokens = maxTokens;
						}
						if (providerOptionsRaw) {
							try {
								(body as IDataObject).providerOptions = JSON.parse(providerOptionsRaw);
							} catch {
								throw new NodeOperationError(this.getNode(), 'Provider Options must be valid JSON', { itemIndex: i });
							}
						}
						return body;
					})(),
				};
				(options as unknown as { baseURL?: string }).baseURL = baseURL;

				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'bozonxMicroservicesApi', options);
				returnData.push({ json: response as IDataObject, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message } as IDataObject, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

