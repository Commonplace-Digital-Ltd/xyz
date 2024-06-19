terraform {
  required_version = "~> 1.8"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.39.0"
    }
  }

  cloud {
    organization = "Commonplace"

    workspaces {
      project = "Map"
      tags = ["map"]
    }
  }
}
