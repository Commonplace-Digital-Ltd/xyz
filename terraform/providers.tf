# Provider configuration
provider "aws" {
  region  = "eu-west-2"

  assume_role {
    role_arn = "arn:aws:iam::676359791502:role/prodAdministrativeAccess"
  }

  default_tags {
    tags = {
      Owner       = "Foundations"
      Repo        = "map"
    }
  }
}
