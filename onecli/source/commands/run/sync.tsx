import React, {useEffect, useState} from 'react';
import {render, Box, Text, Spacer, Newline} from 'ink';
import Spinner from 'ink-spinner';
import * as OneContext from 'onecontext';
import * as zod from 'zod';
import {Credentials} from '../../setup.js';
import fs from "fs";
import {z} from "zod";

const {API_KEY, BASE_URL} = Credentials;

export const options = zod.object({
	BASE_URL: zod.string().default(BASE_URL),
	API_KEY: zod.string().default(API_KEY),
	pipelineName: zod.string().describe('Name of the pipeline to run'),
	overrideArgs: z.object({}).default({}).optional().describe('Override arguments for the pipeline'),
})

type Props = { options: zod.infer<typeof options> };

const RunPipeline = ({options}: Props) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [output, setOutput] = useState<any>([]);

	useEffect(() => {
		try {
			OneContext.runPipeline(options)
				.then(res => {
					if (res?.chunks) {
						setLoading(false);
						setOutput(res.chunks)
					} else {
						setLoading(false)
						setOutput("Failed to run pipeline")
					}
				})
				.catch((error: any) => {
					console.error('Failed to run pipeline:', error);
					setLoading(false)
				});
		} catch (error) {
			console.error('Failed to create pipeline:', error);
			setLoading(false)
		}
	}, []);

	if (loading) {
		return <Text><Text color={"green"}><Spinner type="dots"/></Text>{` Running pipeline`}</Text>
	}

	return (
		<>
			{(output && output.length > 0) ? <Box borderStyle="round" flexDirection="column">
					{
						output.map((o: any, i: number) => {
								return <>
									<Text key={i}><Text color="yellow">id:</Text>
										<Text> {o.id}</Text>
									</Text>
									<Text key={i}><Text color="green">Content:</Text>
										<Text> {o.content}</Text>
									</Text>
									<Text key={i}><Text color="red">Metadata:</Text>
										<Text> {JSON.stringify(o.metadata_json)}</Text>
									</Text>
									{i<output.length-1?<Newline/>:null}
								</>
							}
						)
					}
				</Box>
				:
				<>
					<Box borderStyle="round" flexDirection="column">
						<Text>
							<Text color="yellow">Status:</Text>hi
						</Text>
					</Box>
				</>
			}
		</>
	)
};

export default RunPipeline;

