module "eks-iam" {
  source  = "app.terraform.io/commonplace/eks-iam/aws"
  version = "~>1"

  cluster_name = var.cluster_name
  app_name = var.app_name
  namespace = var.namespace
  environment = var.environment
  custom_policy = {
    Version : "2012-10-17"
    Statement : [
      {
        Effect : "Allow"
        Action : [
          "secretsmanager:GetResourcePolicy",
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
          "secretsmanager:ListSecretVersionIds"
        ],
        Resource : [
          "arn:aws:secretsmanager:${var.aws_region}:${var.aws_account}:secret:${var.environment}/eks/${var.app_name}"
        ]
      },
      {
        "Effect" : "Allow",
        "Action" : [
          "rds-db:connect"
        ],
        "Resource" : [
          "arn:aws:rds-db:${var.aws_region}:${var.aws_account}:dbuser:${var.map_db}/postgres"
        ]
      }
    ]
  }
  managed_policies = []
}
