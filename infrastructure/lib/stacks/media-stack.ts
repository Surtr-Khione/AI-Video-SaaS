import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';

export interface MediaStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  videoUploadBucket: s3.Bucket;
  videoProcessedBucket: s3.Bucket;
  videoThumbnailBucket: s3.Bucket;
}

export class MediaStack extends cdk.Stack {
  public readonly videoProcessingQueue: sqs.Queue;
  public readonly videoProcessingDLQ: sqs.Queue;
  public readonly aiAnalysisQueue: sqs.Queue;
  public readonly aiAnalysisDLQ: sqs.Queue;
  public readonly notificationTopic: sns.Topic;
  public readonly mediaConvertRole: iam.Role;

  constructor(scope: Construct, id: string, props: MediaStackProps) {
    super(scope, id, props);

    const { config, videoUploadBucket, videoProcessedBucket, videoThumbnailBucket } = props;

    // Dead Letter Queues
    this.videoProcessingDLQ = new sqs.Queue(this, 'VideoProcessingDLQ', {
      queueName: `${config.environment}-video-processing-dlq`,
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
    });

    this.aiAnalysisDLQ = new sqs.Queue(this, 'AIAnalysisDLQ', {
      queueName: `${config.environment}-ai-analysis-dlq`,
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
    });

    // Video Processing Queue
    this.videoProcessingQueue = new sqs.Queue(this, 'VideoProcessingQueue', {
      queueName: `${config.environment}-video-processing`,
      visibilityTimeout: cdk.Duration.minutes(15),
      retentionPeriod: cdk.Duration.days(4),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      deadLetterQueue: {
        queue: this.videoProcessingDLQ,
        maxReceiveCount: 3,
      },
    });

    // AI Analysis Queue
    this.aiAnalysisQueue = new sqs.Queue(this, 'AIAnalysisQueue', {
      queueName: `${config.environment}-ai-analysis`,
      visibilityTimeout: cdk.Duration.minutes(10),
      retentionPeriod: cdk.Duration.days(4),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      deadLetterQueue: {
        queue: this.aiAnalysisDLQ,
        maxReceiveCount: 3,
      },
    });

    // SNS Topic for Notifications
    this.notificationTopic = new sns.Topic(this, 'NotificationTopic', {
      topicName: `${config.environment}-video-notifications`,
      displayName: 'Video Processing Notifications',
    });

    // MediaConvert Role
    this.mediaConvertRole = new iam.Role(this, 'MediaConvertRole', {
      assumedBy: new iam.ServicePrincipal('mediaconvert.amazonaws.com'),
      description: 'Role for MediaConvert to access S3 buckets',
    });

    videoUploadBucket.grantRead(this.mediaConvertRole);
    videoProcessedBucket.grantWrite(this.mediaConvertRole);
    videoThumbnailBucket.grantWrite(this.mediaConvertRole);

    this.mediaConvertRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'execute-api:Invoke',
        'execute-api:ManageConnections',
      ],
      resources: ['*'],
    }));

    // S3 Event Notification to trigger video processing
    videoUploadBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(this.videoProcessingQueue),
      {
        suffix: '.mp4',
      }
    );

    videoUploadBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(this.videoProcessingQueue),
      {
        suffix: '.mov',
      }
    );

    videoUploadBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(this.videoProcessingQueue),
      {
        suffix: '.avi',
      }
    );

    // Lambda function for video metadata extraction (example)
    const metadataExtractionRole = new iam.Role(this, 'MetadataExtractionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    videoUploadBucket.grantRead(metadataExtractionRole);
    videoProcessedBucket.grantWrite(metadataExtractionRole);

    metadataExtractionRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'rekognition:DetectLabels',
        'rekognition:DetectModerationLabels',
        'rekognition:DetectText',
        'rekognition:DetectFaces',
        'rekognition:StartLabelDetection',
        'rekognition:GetLabelDetection',
      ],
      resources: ['*'],
    }));

    const metadataFunction = new lambda.Function(this, 'MetadataExtractionFunction', {
      functionName: `${config.environment}-video-metadata-extraction`,
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
import json
import boto3
import os

def handler(event, context):
    """
    Extract metadata from uploaded videos and trigger AI analysis
    """
    print(f"Processing event: {json.dumps(event)}")

    # This is a placeholder. In production, implement:
    # 1. Extract video metadata (duration, resolution, codec, etc.)
    # 2. Generate thumbnail using FFmpeg
    # 3. Trigger Rekognition for content analysis
    # 4. Store metadata in database
    # 5. Send message to AI analysis queue

    return {
        'statusCode': 200,
        'body': json.dumps('Metadata extraction triggered')
    }
      `),
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
      environment: {
        UPLOAD_BUCKET: videoUploadBucket.bucketName,
        PROCESSED_BUCKET: videoProcessedBucket.bucketName,
        THUMBNAIL_BUCKET: videoThumbnailBucket.bucketName,
        AI_ANALYSIS_QUEUE_URL: this.aiAnalysisQueue.queueUrl,
        NOTIFICATION_TOPIC_ARN: this.notificationTopic.topicArn,
      },
      role: metadataExtractionRole,
    });

    // Grant permissions
    this.aiAnalysisQueue.grantSendMessages(metadataFunction);
    this.notificationTopic.grantPublish(metadataFunction);

    // Add SQS trigger to Lambda
    metadataFunction.addEventSource(
      new lambdaEventSources.SqsEventSource(this.videoProcessingQueue, {
        batchSize: 1,
        reportBatchItemFailures: true,
      })
    );

    // CloudWatch Alarms for Queue Depth
    const queueDepthAlarm = this.videoProcessingQueue.metricApproximateNumberOfMessagesVisible().createAlarm(
      this,
      'VideoProcessingQueueDepthAlarm',
      {
        threshold: 100,
        evaluationPeriods: 2,
        alarmDescription: 'Alert when video processing queue depth exceeds 100',
        alarmName: `${config.environment}-video-queue-depth-high`,
      }
    );

    const dlqAlarm = this.videoProcessingDLQ.metricApproximateNumberOfMessagesVisible().createAlarm(
      this,
      'VideoProcessingDLQAlarm',
      {
        threshold: 1,
        evaluationPeriods: 1,
        alarmDescription: 'Alert when messages appear in DLQ',
        alarmName: `${config.environment}-video-dlq-messages`,
      }
    );

    // Subscribe alarms to SNS topic
    this.notificationTopic.addSubscription(
      new subscriptions.EmailSubscription('admin@example.com') // Update with actual email
    );

    // Tags
    Object.entries(config.tags).forEach(([key, value]) => {
      cdk.Tags.of(this).add(key, value);
    });

    // Outputs
    new cdk.CfnOutput(this, 'VideoProcessingQueueUrl', {
      value: this.videoProcessingQueue.queueUrl,
      description: 'Video processing queue URL',
      exportName: `${config.environment}-video-processing-queue-url`,
    });

    new cdk.CfnOutput(this, 'VideoProcessingQueueArn', {
      value: this.videoProcessingQueue.queueArn,
      description: 'Video processing queue ARN',
    });

    new cdk.CfnOutput(this, 'AIAnalysisQueueUrl', {
      value: this.aiAnalysisQueue.queueUrl,
      description: 'AI analysis queue URL',
      exportName: `${config.environment}-ai-analysis-queue-url`,
    });

    new cdk.CfnOutput(this, 'NotificationTopicArn', {
      value: this.notificationTopic.topicArn,
      description: 'Notification topic ARN',
      exportName: `${config.environment}-notification-topic-arn`,
    });

    new cdk.CfnOutput(this, 'MediaConvertRoleArn', {
      value: this.mediaConvertRole.roleArn,
      description: 'MediaConvert role ARN',
      exportName: `${config.environment}-mediaconvert-role-arn`,
    });
  }
}
